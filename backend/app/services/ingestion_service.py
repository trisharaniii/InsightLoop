import logging
import uuid
import json
import csv
import io
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.models import FeedbackItem, ProcessingJob
from app.schemas.schemas import FeedbackCreate
from app.ai.provider import ai_provider
from app.memory.hindsight import hindsight_service
from app.services.insight_service import insight_service

logger = logging.getLogger("insightloop.ingestion")


class IngestionService:
    """
    Handles file upload, CSV/JSON/TXT parsing, batch processing, and async job status tracking.
    Pipeline: Upload -> Validate -> Normalize -> AI Analysis -> Extract Themes -> Detect Issues -> RETAIN INTO HINDSIGHT -> Update DB -> Generate Insights.
    """

    def create_processing_job(self, db: Session, total: int, source: str = "upload") -> ProcessingJob:
        job = ProcessingJob(
            id=str(uuid.uuid4()),
            status="queued",
            source=source,
            total=total,
            processed=0,
            failed=0,
            retained_count=0
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        return job

    def get_job_status(self, db: Session, job_id: str) -> Optional[ProcessingJob]:
        return db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()

    def process_feedback_item(self, db: Session, item: FeedbackCreate) -> FeedbackItem:
        analysis = ai_provider.analyze_feedback(content=item.content, rating=item.rating)

        feedback = FeedbackItem(
            id=str(uuid.uuid4()),
            source=item.source,
            customer_name=item.customer_name,
            customer_email=item.customer_email,
            customer_tier=item.customer_tier or "free",
            rating=item.rating,
            content=item.content,
            sentiment=analysis["sentiment"],
            sentiment_score=analysis["sentiment_score"],
            urgency=analysis["urgency"],
            priority=analysis["priority"],
            summary=analysis["summary"],
            product_area=analysis["product_area"],
            category=analysis["product_area"],
            themes=analysis["themes"],
            issues=analysis["issues"],
            tags=analysis["themes"] + [analysis["product_area"]],
            feature_request=analysis["feature_request"],
            churn_signal=analysis["churn_signal"],
            ai_confidence=analysis["ai_confidence"],
            ai_analyzed=True,
            metadata_json=item.metadata or {},
            status="new"
        )

        db.add(feedback)
        db.commit()
        db.refresh(feedback)

        # RETAIN into Hindsight Memory
        mem_content = f"[{feedback.source.upper()}] ({feedback.customer_tier.upper()} tier): {feedback.content}"
        hindsight_service.retain(
            db=db,
            content=mem_content,
            bank_id="default",
            memory_type="observation",
            metadata={
                "feedback_id": feedback.id,
                "urgency": feedback.urgency,
                "sentiment": feedback.sentiment,
                "product_area": feedback.product_area
            },
            importance_score=0.85 if feedback.urgency in ["critical", "high"] else 0.7
        )

        return feedback

    def process_batch(self, db: Session, items: List[FeedbackCreate], job_id: Optional[str] = None) -> Dict[str, Any]:
        job = None
        if job_id:
            job = db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()
            if job:
                job.status = "processing"
                db.commit()

        processed_count = 0
        success_count = 0
        error_count = 0
        retained_count = 0

        for item in items:
            processed_count += 1
            try:
                created = self.process_feedback_item(db=db, item=item)
                success_count += 1
                if created.urgency in ["critical", "high"] or created.customer_tier == "enterprise":
                    retained_count += 1

                if job:
                    job.processed = processed_count
                    job.retained_count = retained_count
                    db.commit()
            except Exception as e:
                logger.error(f"Error processing item: {e}")
                error_count += 1
                if job:
                    job.failed = error_count
                    db.commit()

        # Update job status to completed
        if job:
            job.status = "completed"
            job.processed = processed_count
            db.commit()

        # Generate/update insights
        insight_service.generate_insights(db=db)

        return {
            "job_id": job.id if job else str(uuid.uuid4()),
            "status": "completed",
            "total": len(items),
            "processed": processed_count,
            "failed": error_count,
            "retained_in_hindsight": retained_count
        }

    def process_file_upload(self, db: Session, file_bytes: bytes, filename: str, source: str = "upload") -> ProcessingJob:
        content_str = file_bytes.decode("utf-8", errors="ignore")
        items: List[FeedbackCreate] = []

        if filename.endswith(".json"):
            try:
                parsed_json = json.loads(content_str)
                if isinstance(parsed_json, list):
                    for obj in parsed_json:
                        txt = obj.get("content") or obj.get("text") or obj.get("feedback") or ""
                        if txt.strip():
                            items.append(FeedbackCreate(
                                source=source,
                                customer_name=obj.get("customer_name") or obj.get("name"),
                                customer_email=obj.get("customer_email") or obj.get("email"),
                                customer_tier=obj.get("customer_tier") or "free",
                                rating=obj.get("rating"),
                                content=txt,
                                metadata={"raw": obj}
                            ))
            except Exception as e:
                logger.error(f"Error parsing JSON: {e}")
        elif filename.endswith(".csv"):
            reader = csv.DictReader(io.StringIO(content_str))
            for row in reader:
                txt = row.get("content") or row.get("feedback") or row.get("text") or row.get("message") or ""
                if txt.strip():
                    raw_rating = row.get("rating") or row.get("score")
                    rating = int(raw_rating) if (raw_rating and raw_rating.isdigit()) else None
                    items.append(FeedbackCreate(
                        source=source,
                        customer_name=row.get("customer_name") or row.get("name") or row.get("author"),
                        customer_email=row.get("customer_email") or row.get("email"),
                        customer_tier=row.get("customer_tier") or row.get("tier") or "free",
                        rating=rating,
                        content=txt,
                        metadata={"raw": dict(row)}
                    ))
        else:
            # Fallback for plain TXT file (line per feedback)
            lines = content_str.splitlines()
            for line in lines:
                if line.strip():
                    items.append(FeedbackCreate(
                        source=source,
                        content=line.strip(),
                        customer_tier="free"
                    ))

        job = self.create_processing_job(db=db, total=len(items), source=source)
        # Execute batch processing synchronously or inline for immediate results
        self.process_batch(db=db, items=items, job_id=job.id)
        return job


ingestion_service = IngestionService()
