from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import get_db
from app.core.config import get_settings
from app.memory.hindsight import hindsight_service, HINDSIGHT_SDK_AVAILABLE
from app.ai.provider import ai_provider, OPENAI_SDK_AVAILABLE

router = APIRouter(tags=["System Health"])
settings = get_settings()


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Check health of database, Hindsight persistent memory, and AI provider."""
    # Check DB
    db_ok = True
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_ok = False

    hindsight_connected = hindsight_service.client is not None

    return {
        "status": "healthy" if db_ok else "degraded",
        "app": settings.PROJECT_NAME,
        "database": "connected" if db_ok else "error",
        "hindsight": {
            "status": "active",
            "base_url": settings.HINDSIGHT_BASE_URL,
            "sdk_installed": HINDSIGHT_SDK_AVAILABLE,
            "sdk_connected": hindsight_connected,
            "persistence_mode": "hindsight_plus_database_shadow"
        },
        "ai_provider": {
            "model": settings.OPENAI_MODEL,
            "active": "openai" if (OPENAI_SDK_AVAILABLE and settings.OPENAI_API_KEY) else "deterministic_smart_engine"
        }
    }
