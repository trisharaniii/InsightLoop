import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import Base, engine, SessionLocal
from app.models import models
from app.api import (
    auth,
    feedback,
    memory,
    insights,
    roadmap,
    actions,
    releases,
    search,
    ingest,
    ingestion,
    sources,
    dashboard,
    health
)
from app.seed import seed_initial_database

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("insightloop.main")

settings = get_settings()

# Initialize FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Customer Feedback Intelligence Platform with Hindsight Persistent Memory Integration",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed demo database with 50+ feedback, releases, themes, and Hindsight memories
    db = SessionLocal()
    try:
        seed_initial_database(db)
    except Exception as e:
        logger.warning(f"Database seed notice: {e}")
    finally:
        db.close()
    
    logger.info("InsightLoop backend service ready with Hindsight Persistent Memory!")


@app.get("/", tags=["Health"])
def root():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "hindsight_integration": "active"
    }


# Include Routers under /api/v1
app.include_router(auth.router, prefix="/api/v1")
app.include_router(feedback.router, prefix="/api/v1")
app.include_router(memory.router, prefix="/api/v1")
app.include_router(insights.router, prefix="/api/v1")
app.include_router(roadmap.router, prefix="/api/v1")
app.include_router(actions.router, prefix="/api/v1")
app.include_router(releases.router, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")
app.include_router(ingest.router, prefix="/api/v1")
app.include_router(ingestion.router, prefix="/api/v1")
app.include_router(sources.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(health.router, prefix="/api/v1")
app.include_router(health.router)  # /health root level as well
