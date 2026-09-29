from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import InsightCluster
from app.schemas.schemas import InsightClusterResponse
from app.services.insight_service import insight_service

router = APIRouter(prefix="/insights", tags=["AI Insights & Theme Discovery"])


@router.get("", response_model=List[InsightClusterResponse])
def get_insights(
    status_filter: Optional[str] = Query(None, alias="status"),
    min_impact: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Retrieve AI-synthesized, evidence-backed insights based on:
    - Current feedback
    - Historical Hindsight memories
    - Recurring themes & issue frequency
    - Sentiment changes & release history
    """
    return insight_service.get_insights(db=db, status=status_filter, min_impact=min_impact)


@router.post("/generate", response_model=List[InsightClusterResponse])
def generate_insights(db: Session = Depends(get_db)):
    """
    Generate evidence-backed insights synthesizing current feedback and persistent Hindsight memories.
    """
    return insight_service.generate_insights(db=db)


@router.post("/recluster", response_model=List[InsightClusterResponse])
def recluster_feedback(db: Session = Depends(get_db)):
    """
    Alias for POST /insights/generate. Reclusters customer signals.
    """
    return insight_service.generate_insights(db=db)


@router.get("/{cluster_id}", response_model=InsightClusterResponse)
def get_cluster_detail(cluster_id: str, db: Session = Depends(get_db)):
    """Get detailed statistics and sample quotes for a specific theme insight."""
    cluster = db.query(InsightCluster).filter(InsightCluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(status_code=404, detail="Insight cluster not found")
    return cluster
