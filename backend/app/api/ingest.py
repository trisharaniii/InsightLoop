from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import ProcessingJob
from app.schemas.schemas import BatchIngestRequest, IngestStatusResponse, ProcessingJobResponse
from app.services.ingestion_service import ingestion_service

router = APIRouter(prefix="/ingestion", tags=["Feedback Ingestion Pipeline"])


@router.post("/upload")
async def upload_feedback_file(
    file: UploadFile = File(...),
    source: str = Form("upload"),
    db: Session = Depends(get_db)
):
    """
    INGESTION PIPELINE:
    Upload CSV, JSON, or TXT customer feedback file.
    Validates, normalizes, executes AI analysis, extracts themes,
    detects recurring issues, retains into Hindsight, updates DB, and generates insights.
    Returns tracking job_id.
    """
    filename = file.filename or "feedback.csv"
    if not (filename.endswith(".csv") or filename.endswith(".json") or filename.endswith(".txt")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Supported formats: .csv, .json, .txt"
        )

    file_bytes = await file.read()
    job = ingestion_service.process_file_upload(
        db=db,
        file_bytes=file_bytes,
        filename=filename,
        source=source
    )

    return {
        "job_id": job.id,
        "status": job.status,
        "total": job.total,
        "processed": job.processed,
        "failed": job.failed,
        "retained_count": job.retained_count
    }


@router.get("/jobs/{job_id}")
def get_job_status(job_id: str, db: Session = Depends(get_db)):
    """
    GET /api/v1/ingestion/jobs/{job_id}:
    Check asynchronous or batch processing status.
    Returns status: queued | processing | completed | failed.
    """
    job = ingestion_service.get_job_status(db=db, job_id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "job_id": job.id,
        "status": job.status,
        "total": job.total,
        "processed": job.processed,
        "failed": job.failed,
        "retained_count": job.retained_count,
        "source": job.source,
        "error_message": job.error_message
    }


@router.post("/batch")
def batch_ingest(req: BatchIngestRequest, db: Session = Depends(get_db)):
    """Ingest a batch array of customer feedback items."""
    res = ingestion_service.process_batch(db=db, items=req.items)
    return res


@router.post("/csv")
async def csv_ingest(
    file: UploadFile = File(...),
    source: str = Form("csv_upload"),
    db: Session = Depends(get_db)
):
    """Convenience endpoint for CSV file upload."""
    return await upload_feedback_file(file=file, source=source, db=db)
