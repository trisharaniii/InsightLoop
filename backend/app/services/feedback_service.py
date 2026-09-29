import uuid
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.models import FeedbackItem
from app.schemas.schemas import FeedbackCreate, FeedbackUpdate
from app.ai.provider import ai_provider
from app.memory.hindsight import hindsight_service

logger = logging.getLogger("insightloop.feedback_service")


class FeedbackService:
    """
    Business logic for Feedback ingestion, retrieval, filtering, and AI analysis pipeline.
    Pipeline: Ingest -> AI Analysis -> Extract Themes & Issues -> RETAIN into Hindsight -> Update DB
    """

    def create_feedback(self, db: Session, item: FeedbackCreate) -> FeedbackItem:
        """
        Create feedback item, execute AI analysis, retain into Hindsight persistent memory, save to DB.
        """
        # 1. AI Analysis
        analysis = ai_provider.analyze_feedback(content=item.content, rating=item.rating)

        feedback_id = str(uuid.uuid4())
        feedback = FeedbackItem(
            id=feedback_id,
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

        # 2. RETAIN into Hindsight persistent memory
        mem_content = f"[{feedback.source.upper()}] ({feedback.customer_tier.upper()} tier): {feedback.content}"
        mem = hindsight_service.retain(
            db=db,
            content=mem_content,
            bank_id="default",
            memory_type="observation",
            metadata={
                "feedback_id": feedback.id,
                "source": feedback.source,
                "sentiment": feedback.sentiment,
                "urgency": feedback.urgency,
                "product_area": feedback.product_area,
                "issues": feedback.issues,
                "customer_tier": feedback.customer_tier
            },
            importance_score=0.9 if feedback.urgency in ["critical", "high"] else 0.7
        )

        feedback.memory_retained = True
        feedback.memory_id = mem.id
        db.commit()

        logger.info(f"Feedback {feedback.id} ingested, analyzed ({feedback.sentiment}), and retained into Hindsight.")
        return feedback

    def get_feedback(self, db: Session, feedback_id: str) -> Optional[FeedbackItem]:
        """
        Get feedback item by ID, including associated AI analysis and recalled memories.
        """
        return db.query(FeedbackItem).filter(FeedbackItem.id == feedback_id).first()

    def list_feedback(
        self,
        db: Session,
        search: Optional[str] = None,
        source: Optional[str] = None,
        sentiment: Optional[str] = None,
        priority: Optional[str] = None,
        urgency: Optional[str] = None,
        theme: Optional[str] = None,
        product_area: Optional[str] = None,
        status: Optional[str] = None,
        customer_tier: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[FeedbackItem]:
        """
        Filter feedback items with comprehensive criteria.
        """
        query = db.query(FeedbackItem)

        if source and source != "all":
            query = query.filter(FeedbackItem.source == source)
        if sentiment and sentiment != "all":
            query = query.filter(FeedbackItem.sentiment == sentiment)
        if priority and priority != "all":
            query = query.filter(FeedbackItem.priority == priority)
        if urgency and urgency != "all":
            query = query.filter(FeedbackItem.urgency == urgency)
        if product_area and product_area != "all":
            query = query.filter(FeedbackItem.product_area == product_area)
        if status and status != "all":
            query = query.filter(FeedbackItem.status == status)
        if customer_tier and customer_tier != "all":
            query = query.filter(FeedbackItem.customer_tier == customer_tier)

        if search:
            search_fmt = f"%{search}%"
            query = query.filter(
                (FeedbackItem.content.ilike(search_fmt)) |
                (FeedbackItem.customer_name.ilike(search_fmt)) |
                (FeedbackItem.summary.ilike(search_fmt)) |
                (FeedbackItem.product_area.ilike(search_fmt))
            )

        return query.order_by(FeedbackItem.created_at.desc()).offset(offset).limit(limit).all()

    def update_feedback(self, db: Session, feedback_id: str, update_in: FeedbackUpdate) -> Optional[FeedbackItem]:
        item = db.query(FeedbackItem).filter(FeedbackItem.id == feedback_id).first()
        if not item:
            return None

        if update_in.sentiment is not None:
            item.sentiment = update_in.sentiment
        if update_in.urgency is not None:
            item.urgency = update_in.urgency
        if update_in.status is not None:
            item.status = update_in.status
        if update_in.assigned_to is not None:
            item.assigned_to = update_in.assigned_to
        if update_in.tags is not None:
            item.tags = update_in.tags

        item.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(item)
        return item


feedback_service = FeedbackService()
