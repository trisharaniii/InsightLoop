import logging
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.models import ActionItem
from app.schemas.schemas import ActionItemCreate, ActionItemUpdate
from app.memory.hindsight import hindsight_service

logger = logging.getLogger("insightloop.action_service")


class ActionService:
    """
    Action Hub Service handling creation, execution, status updates, and Hindsight memory tracking for product actions.
    Connects to Insight, Issue, Evidence, and Release.
    Statuses: Open, Investigating, In Progress, Completed, Verified.
    """

    def list_actions(
        self,
        db: Session,
        status: Optional[str] = None,
        priority: Optional[str] = None
    ) -> List[ActionItem]:
        query = db.query(ActionItem)
        if status and status != "all":
            query = query.filter(ActionItem.status == status)
        if priority and priority != "all":
            query = query.filter(ActionItem.priority == priority)
        return query.order_by(ActionItem.created_at.desc()).all()

    def get_action(self, db: Session, action_id: str) -> Optional[ActionItem]:
        return db.query(ActionItem).filter(ActionItem.id == action_id).first()

    def create_action(self, db: Session, action_in: ActionItemCreate) -> ActionItem:
        action_id = str(uuid.uuid4())

        ext_id = f"LIN-{uuid.uuid4().hex[:6].upper()}"
        execution_meta = {
            "external_id": ext_id,
            "external_url": f"https://linear.app/insightloop/issue/{ext_id}",
            "created_by": action_in.owner or "Product Manager",
            "executed_at": datetime.now(timezone.utc).isoformat()
        }

        # Statuses: Open, Investigating, In Progress, Completed, Verified
        status = action_in.status if action_in.status in ["Open", "Investigating", "In Progress", "Completed", "Verified"] else "Open"
        priority = action_in.priority or ("P0" if "payment" in action_in.title.lower() else "P1")

        action = ActionItem(
            id=action_id,
            title=action_in.title,
            description=action_in.description,
            action_type=action_in.action_type,
            target_system=action_in.target_system,
            payload=action_in.payload or {},
            status=status,
            priority=priority,
            owner=action_in.owner or "Sarah Chen",
            due_date=action_in.due_date,
            product_area=action_in.product_area or "Payments & Checkout",
            execution_result=execution_meta,
            insight_id=getattr(action_in, "insight_id", None) or getattr(action_in, "insight_cluster_id", None),
            issue_id=action_in.issue_id,
            release_id=action_in.release_id,
            roadmap_item_id=action_in.roadmap_item_id,
            insight_cluster_id=getattr(action_in, "insight_cluster_id", None) or getattr(action_in, "insight_id", None),
            linked_feedback_ids=action_in.linked_feedback_ids or []
        )

        db.add(action)
        db.commit()

        # RETAIN action decision in Hindsight persistent memory
        hindsight_service.retain(
            db=db,
            content=f"Product Action created: '{action.title}' linked to {action.target_system} ({ext_id}). Priority: {action.priority}, Status: {action.status}.",
            bank_id="default",
            memory_type="decision",
            metadata={
                "action_id": action.id,
                "external_id": ext_id,
                "priority": action.priority,
                "status": action.status,
                "insight_id": action.insight_id,
                "issue_id": action.issue_id
            },
            importance_score=0.9
        )

        db.refresh(action)
        return action

    def update_action(
        self,
        db: Session,
        action_id: str,
        update_in: ActionItemUpdate
    ) -> Optional[ActionItem]:
        action = db.query(ActionItem).filter(ActionItem.id == action_id).first()
        if not action:
            return None

        if update_in.title is not None:
            action.title = update_in.title
        if update_in.description is not None:
            action.description = update_in.description
        if update_in.priority is not None:
            action.priority = update_in.priority
        if update_in.status is not None:
            action.status = update_in.status
        if update_in.owner is not None:
            action.owner = update_in.owner
        if update_in.due_date is not None:
            action.due_date = update_in.due_date
        if update_in.release_id is not None:
            action.release_id = update_in.release_id

        action.updated_at = datetime.now(timezone.utc)
        db.commit()

        # RETAIN status change in Hindsight memory
        hindsight_service.retain(
            db=db,
            content=f"Action '{action.title}' status updated to '{action.status}'. Owner: {action.owner}.",
            bank_id="default",
            memory_type="decision",
            metadata={"action_id": action.id, "status": action.status, "priority": action.priority},
            importance_score=0.8
        )

        db.refresh(action)
        return action


action_service = ActionService()
