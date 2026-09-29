from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import FeedbackItem
from app.schemas.schemas import FeedbackCreate, FeedbackResponse, FeedbackDetailResponse, FeedbackUpdate
from app.services.feedback_service import feedback_service
from app.services.ingestion_service import ingestion_service
from app.memory.hindsight import hindsight_service

router = APIRouter(prefix="/feedback", tags=["Customer Feedback"])


@router.get("", response_model=List[FeedbackResponse])
def list_feedback(
    source: Optional[str] = Query(None),
    sentiment: Optional[str] = Query(None),
    urgency: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    customer_tier: Optional[str] = Query(None),
    theme: Optional[str] = Query(None),
    product_area: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    release_id: Optional[str] = Query(None),
    date_range: Optional[str] = Query(None),  # 7d, 30d, 90d, all
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    order: str = Query("desc"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    List customer feedback items with multi-attribute filtering, search, sorting, and pagination.
    """
    query = db.query(FeedbackItem)

    if source and source != "all":
        query = query.filter(FeedbackItem.source == source)
    if sentiment and sentiment != "all":
        query = query.filter(FeedbackItem.sentiment == sentiment)
    if urgency and urgency != "all":
        query = query.filter(FeedbackItem.urgency == urgency)
    if priority and priority != "all":
        query = query.filter(FeedbackItem.priority == priority)
    if customer_tier and customer_tier != "all":
        query = query.filter(FeedbackItem.customer_tier == customer_tier)
    if product_area and product_area != "all":
        query = query.filter(FeedbackItem.product_area == product_area)
    if theme and theme != "all":
        theme_fmt = f"%{theme}%"
        query = query.filter(FeedbackItem.category.ilike(theme_fmt))
    if status_filter and status_filter != "all":
        query = query.filter(FeedbackItem.status == status_filter)
    if release_id and release_id != "all":
        query = query.filter(FeedbackItem.release_id == release_id)

    if date_range and date_range != "all":
        days = 7 if date_range == "7d" else (30 if date_range == "30d" else 90)
        since = datetime.now(timezone.utc) - timedelta(days=days)
        query = query.filter(FeedbackItem.created_at >= since)

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (FeedbackItem.content.ilike(search_fmt)) |
            (FeedbackItem.customer_name.ilike(search_fmt)) |
            (FeedbackItem.category.ilike(search_fmt)) |
            (FeedbackItem.product_area.ilike(search_fmt)) |
            (FeedbackItem.summary.ilike(search_fmt))
        )

    # Sorting
    sort_col = getattr(FeedbackItem, sort_by, FeedbackItem.created_at)
    if order.lower() == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())

    feedbacks = query.offset(offset).limit(limit).all()
    return feedbacks


@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def create_feedback(item: FeedbackCreate, db: Session = Depends(get_db)):
    """
    Ingest a single customer feedback item.
    Pipeline: Validate -> AI Analysis -> Extract Themes/Issues -> RETAIN into Hindsight -> Save to DB.
    """
    created = feedback_service.create_feedback(db=db, item=item)
    return created


@router.get("/{feedback_id}", response_model=FeedbackDetailResponse)
def get_feedback(feedback_id: str, db: Session = Depends(get_db)):
    """
    Retrieve single feedback item along with:
    - Original feedback & AI analysis
    - Themes & Issues
    - Related feedback
    - Relevant memories recalled from Hindsight
    """
    item = db.query(FeedbackItem).filter(FeedbackItem.id == feedback_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Feedback item not found")

    # Find related feedback items (same area or issues)
    related = []
    if item.product_area:
        related = db.query(FeedbackItem).filter(
            FeedbackItem.id != item.id,
            FeedbackItem.product_area == item.product_area
        ).limit(4).all()

    # Recall relevant historical memories from Hindsight
    query_text = f"{item.product_area or ''} {item.content[:80]}"
    mems = hindsight_service.recall(db=db, query=query_text, top_k=3)
    mem_dicts = [
        {
            "id": m.id,
            "memory_type": m.memory_type,
            "content": m.content,
            "importance_score": m.importance_score,
            "metadata": m.metadata_json
        }
        for m in mems
    ]

    fb_dict = FeedbackResponse.model_validate(item).model_dump()
    fb_dict["related_feedback"] = [FeedbackResponse.model_validate(r) for r in related]
    fb_dict["relevant_memories"] = mem_dicts
    return FeedbackDetailResponse(**fb_dict)


@router.patch("/{feedback_id}", response_model=FeedbackResponse)
def update_feedback(feedback_id: str, update_in: FeedbackUpdate, db: Session = Depends(get_db)):
    """Update feedback status, priority, urgency, assignment, or tags."""
    item = feedback_service.update_feedback(db=db, feedback_id=feedback_id, update_in=update_in)
    if not item:
        raise HTTPException(status_code=404, detail="Feedback item not found")
    return item


@router.delete("/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_feedback(feedback_id: str, db: Session = Depends(get_db)):
    """Delete a feedback item."""
    item = db.query(FeedbackItem).filter(FeedbackItem.id == feedback_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Feedback item not found")
    db.delete(item)
    db.commit()
    return None
