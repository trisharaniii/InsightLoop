import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import RoadmapItem
from app.schemas.schemas import RoadmapItemCreate, RoadmapItemResponse, RoadmapItemUpdate

router = APIRouter(prefix="/roadmap", tags=["Roadmap & Prioritization"])


@router.get("", response_model=List[RoadmapItemResponse])
def get_roadmap_items(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """List roadmap items sorted by impact score and priority."""
    query = db.query(RoadmapItem)
    if status_filter and status_filter != "all":
        query = query.filter(RoadmapItem.status == status_filter)
    if priority and priority != "all":
        query = query.filter(RoadmapItem.priority == priority)

    items = query.order_by(RoadmapItem.impact_score.desc(), RoadmapItem.created_at.desc()).all()
    return items


@router.post("", response_model=RoadmapItemResponse, status_code=status.HTTP_201_CREATED)
def create_roadmap_item(item_in: RoadmapItemCreate, db: Session = Depends(get_db)):
    """Create a new roadmap item linked to feedback clusters."""
    item = RoadmapItem(
        id=str(uuid.uuid4()),
        title=item_in.title,
        description=item_in.description,
        status=item_in.status,
        priority=item_in.priority,
        impact_score=item_in.impact_score,
        effort_estimate=item_in.effort_estimate,
        target_release=item_in.target_release,
        insight_cluster_ids=item_in.insight_cluster_ids or [],
        linked_feedback_ids=item_in.linked_feedback_ids or []
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=RoadmapItemResponse)
def update_roadmap_item(item_id: str, update_in: RoadmapItemUpdate, db: Session = Depends(get_db)):
    """Update roadmap status, target release, or priority."""
    item = db.query(RoadmapItem).filter(RoadmapItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Roadmap item not found")

    for field, value in update_in.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_roadmap_item(item_id: str, db: Session = Depends(get_db)):
    """Delete a roadmap item."""
    item = db.query(RoadmapItem).filter(RoadmapItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Roadmap item not found")
    db.delete(item)
    db.commit()
    return None
