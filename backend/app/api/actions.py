from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import ActionItem
from app.schemas.schemas import ActionItemCreate, ActionItemUpdate, ActionItemResponse
from app.services.action_service import action_service

router = APIRouter(prefix="/actions", tags=["Action Hub & Product Decisions"])


@router.get("", response_model=List[ActionItemResponse])
def list_actions(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    List product actions across statuses:
    Open, Investigating, In Progress, Completed, Verified.
    """
    return action_service.list_actions(db=db, status=status_filter, priority=priority)


@router.post("", response_model=ActionItemResponse, status_code=status.HTTP_201_CREATED)
def create_action(action_in: ActionItemCreate, db: Session = Depends(get_db)):
    """
    Create a product action connecting Insight, Issue, Evidence, and Release.
    Retains the action decision into Hindsight persistent memory.
    """
    return action_service.create_action(db=db, action_in=action_in)


@router.get("/{action_id}", response_model=ActionItemResponse)
def get_action(action_id: str, db: Session = Depends(get_db)):
    """Retrieve details for a single product action."""
    action = action_service.get_action(db=db, action_id=action_id)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    return action


@router.patch("/{action_id}", response_model=ActionItemResponse)
def update_action(action_id: str, update_in: ActionItemUpdate, db: Session = Depends(get_db)):
    """
    Update status, priority, owner, or release for an action.
    Retains status transition into Hindsight persistent memory.
    """
    updated = action_service.update_action(db=db, action_id=action_id, update_in=update_in)
    if not updated:
        raise HTTPException(status_code=404, detail="Action not found")
    return updated
