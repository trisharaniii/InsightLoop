from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Release
from app.schemas.schemas import (
    ReleaseLogCreate,
    ReleaseLogResponse,
    ReleaseImpactResponse,
    ReleaseVerifyResponse
)
from app.services.release_service import release_service

router = APIRouter(prefix="/releases", tags=["Release Intelligence & Impact Verification"])


@router.get("", response_model=List[ReleaseLogResponse])
def get_releases(db: Session = Depends(get_db)):
    """List software releases with pre vs post sentiment impact and resolution rates."""
    return release_service.list_releases(db=db)


@router.post("", response_model=ReleaseLogResponse, status_code=status.HTTP_201_CREATED)
def create_release(rel_in: ReleaseLogCreate, db: Session = Depends(get_db)):
    """
    Log a new release, connect it to targeted issues/features,
    and retain the release event into Hindsight persistent memory.
    """
    rel = release_service.create_release(db=db, rel_in=rel_in)
    return rel


@router.get("/{release_id}", response_model=ReleaseLogResponse)
def get_release(release_id: str, db: Session = Depends(get_db)):
    """Retrieve details for a single release."""
    rel = release_service.get_release(db=db, release_id=release_id)
    if not rel:
        raise HTTPException(status_code=404, detail="Release not found")
    return rel


@router.get("/{release_id}/impact", response_model=ReleaseImpactResponse)
def get_release_impact(release_id: str, db: Session = Depends(get_db)):
    """
    RELEASE IMPACT ANALYSIS:
    Calculates before vs after complaint volume and sentiment shift.
    Uses historical feedback and Hindsight memory to provide context.
    Carefully distinguishes: 'Feedback mentioning the issue decreased after the release.'
    """
    res = release_service.get_release_impact(db=db, release_id=release_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res


@router.post("/{release_id}/verify", response_model=ReleaseVerifyResponse)
def verify_release_impact(release_id: str, db: Session = Depends(get_db)):
    """
    IMPACT VERIFICATION (Final Step in InsightLoop):
    1. Retrieve historical issue memories from Hindsight.
    2. Retrieve post-release feedback.
    3. Compare relevant signals.
    4. Determine whether the issue improved.
    5. Store the verified outcome.
    6. RETAIN the outcome into Hindsight so future product questions reference it!
    """
    res = release_service.verify_impact(db=db, release_id=release_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res
