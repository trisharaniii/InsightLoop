from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import MemoryItem
from app.schemas.schemas import (
    HindsightMemoryRetainRequest,
    MemoryRecallRequest,
    MemoryRecallResponse,
    MemoryChatRequest,
    MemoryChatResponse,
    RecurringIssueResponse,
    MemoryItemResponse,
    HindsightReflectRequest,
)
from app.services.memory_service import memory_service
from app.memory.hindsight import hindsight_service

router = APIRouter(prefix="/memory", tags=["Hindsight Persistent Memory"])


@router.get("", response_model=List[MemoryItemResponse])
def list_memories(
    bank_id: str = Query("default"),
    memory_type: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """List persistent agent memories stored in Hindsight Bank."""
    query = db.query(MemoryItem).filter(MemoryItem.bank_id == bank_id)
    if memory_type and memory_type != "all":
        query = query.filter(MemoryItem.memory_type == memory_type)
    
    memories = query.order_by(MemoryItem.importance_score.desc(), MemoryItem.created_at.desc()).limit(limit).all()
    return memories


@router.post("/retain", response_model=MemoryItemResponse, status_code=status.HTTP_201_CREATED)
def retain_memory(req: HindsightMemoryRetainRequest, db: Session = Depends(get_db)):
    """
    RETAIN: Explicitly store a new customer feedback observation, theme, decision,
    or release outcome into Hindsight persistent agent memory.
    """
    mem = memory_service.retain(
        db=db,
        content=req.content,
        bank_id=req.bank_id,
        memory_type=req.memory_type,
        metadata=req.metadata,
        importance_score=req.importance_score
    )
    return mem


@router.post("/recall", response_model=MemoryRecallResponse)
def recall_memories(req: MemoryRecallRequest, db: Session = Depends(get_db)):
    """
    RECALL: Query Hindsight to recall relevant historical memories, connected feedback,
    issues, themes, releases, evidence, and confidence.
    Explains: 'This issue has appeared across multiple feedback sources over time.'
    """
    res = memory_service.recall(
        db=db,
        query=req.query,
        bank_id=req.bank_id,
        top_k=req.top_k,
        memory_types=req.memory_types
    )
    return res


@router.post("/chat", response_model=MemoryChatResponse)
def memory_chat(req: MemoryChatRequest, db: Session = Depends(get_db)):
    """
    MEMORY CHAT: Reason over recalled persistent memories and current customer feedback
    to produce evidence-backed answers.
    Demonstrates WITH HINDSIGHT vs WITHOUT MEMORY reasoning.
    """
    res = memory_service.chat(
        db=db,
        query=req.query,
        bank_id=req.bank_id,
        compare_mode=req.compare_mode
    )
    return res


@router.get("/recurring-issues", response_model=List[RecurringIssueResponse])
def get_recurring_issues(bank_id: str = Query("default"), db: Session = Depends(get_db)):
    """
    RECURRING ISSUE DETECTION:
    Combines recalled historical memory + current feedback to identify persistent,
    cross-release recurring problems with metrics (historical mentions, trend, confidence).
    """
    issues = memory_service.detect_recurring_issues(db=db, bank_id=bank_id)
    return issues


@router.get("/compare")
def compare_memory(query: str = Query(..., description="Question to compare with/without memory"), db: Session = Depends(get_db)):
    """
    BEFORE/AFTER DEMONSTRATION:
    Shows clear contrast between:
    - WITHOUT MEMORY (only sees the single isolated item)
    - WITH HINDSIGHT (recalls historical pattern, releases, and systemic context)
    """
    res = memory_service.compare_memory(db=db, query=query)
    return res


@router.post("/reflect")
def reflect_on_memory(req: HindsightReflectRequest, db: Session = Depends(get_db)):
    """
    REFLECT: Perform strategic synthesis across historical persistent memory banks.
    """
    res = memory_service.reflect(
        db=db,
        question=req.question,
        bank_id=req.bank_id
    )
    return res


@router.get("/discover")
def discover_patterns(bank_id: str = Query("default"), db: Session = Depends(get_db)):
    """
    DISCOVER: Extract emerging trends, systemic patterns, and recurring issues from persistent agent memory.
    """
    patterns = hindsight_service.discover(db=db, bank_id=bank_id)
    return {"bank_id": bank_id, "discovered_patterns": patterns}
