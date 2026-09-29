from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import FeedbackItem, InsightCluster, Release, ActionItem, MemoryItem
from app.schemas.schemas import SearchQuery, AgentReasoningResponse, UnifiedSearchResponse
from app.services.ai_service import ai_service
from app.memory.hindsight import hindsight_service

router = APIRouter(prefix="/search", tags=["Unified Search & Agent RAG"])


@router.get("", response_model=UnifiedSearchResponse)
def unified_search(
    q: str = Query(..., description="Query term to search across all intelligence data"),
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """
    UNIFIED SEARCH:
    Searches across Feedback, Themes, Issues, Insights, Releases, Actions, and Hindsight Memory.
    Returns grouped results suitable for the frontend command palette and search interface.
    """
    term = f"%{q}%"
    q_lower = q.lower()

    # 1. Feedback
    feedbacks = db.query(FeedbackItem).filter(
        (FeedbackItem.content.ilike(term)) |
        (FeedbackItem.customer_name.ilike(term)) |
        (FeedbackItem.category.ilike(term)) |
        (FeedbackItem.product_area.ilike(term))
    ).limit(limit).all()

    # 2. Themes & Issues
    themes_set = set()
    issues_set = set()
    for f in db.query(FeedbackItem).all():
        if f.themes:
            for t in f.themes:
                if q_lower in t.lower():
                    themes_set.add(t)
        if f.issues:
            for iss in f.issues:
                if q_lower in iss.lower():
                    issues_set.add(iss)
        if f.product_area and q_lower in f.product_area.lower():
            themes_set.add(f.product_area)

    # 3. Insights
    insights = db.query(InsightCluster).filter(
        (InsightCluster.title.ilike(term)) |
        (InsightCluster.theme.ilike(term)) |
        (InsightCluster.description.ilike(term))
    ).limit(limit).all()

    # 4. Releases
    releases = db.query(Release).filter(
        (Release.version.ilike(term)) |
        (Release.title.ilike(term)) |
        (Release.summary.ilike(term))
    ).limit(limit).all()

    # 5. Actions
    actions = db.query(ActionItem).filter(
        (ActionItem.title.ilike(term)) |
        (ActionItem.description.ilike(term)) |
        (ActionItem.target_system.ilike(term))
    ).limit(limit).all()

    # 6. Hindsight Memory
    memories = hindsight_service.recall(db=db, query=q, top_k=limit)

    return {
        "query": q,
        "feedback": feedbacks,
        "themes": list(themes_set)[:limit],
        "issues": list(issues_set)[:limit],
        "insights": insights,
        "releases": releases,
        "actions": actions,
        "memory": memories
    }


@router.post("", response_model=AgentReasoningResponse)
def search_agent_rag(req: SearchQuery, db: Session = Depends(get_db)):
    """
    Perform natural language AI search over persistent Hindsight memory and customer feedback.
    Returns agent reasoning, recalled memories, and supporting feedback quotes.
    """
    result = ai_service.run_agent_rag_query(
        db=db,
        query=req.query,
        include_hindsight_memory=req.include_hindsight_memory,
        top_k=req.top_k
    )
    return result
