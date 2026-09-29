import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    String, Text, Float, Integer, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _uuid() -> str:
    return str(uuid.uuid4())


# ── Workspace ──────────────────────────────────────────────────────────────────

class Workspace(Base):
    __tablename__ = "workspaces"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    users: Mapped[list["User"]] = relationship(back_populates="workspace")
    feedback: Mapped[list["Feedback"]] = relationship(back_populates="workspace")
    releases: Mapped[list["Release"]] = relationship(back_populates="workspace")
    actions: Mapped[list["Action"]] = relationship(back_populates="workspace")
    insights: Mapped[list["Insight"]] = relationship(back_populates="workspace")


# ── User ───────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    workspace_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("workspaces.id"), nullable=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), default="Product Lead")
    avatar: Mapped[str | None] = mapped_column(String(500), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50), default="product_manager")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    workspace: Mapped["Workspace | None"] = relationship(back_populates="users")


# ── Feedback ───────────────────────────────────────────────────────────────────

class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    workspace_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("workspaces.id"), nullable=True, index=True)
    source: Mapped[str] = mapped_column(String(50))
    external_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    customer_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    customer_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    customer_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    customer_tier: Mapped[str | None] = mapped_column(String(50), default="free")
    customer_segment: Mapped[str | None] = mapped_column(String(100), nullable=True)
    customer_role: Mapped[str | None] = mapped_column(String(255), nullable=True)
    content: Mapped[str] = mapped_column(Text)
    rating: Mapped[float | None] = mapped_column(Float, nullable=True)

    # AI analysis fields
    sentiment: Mapped[str] = mapped_column(String(20), default="neutral")
    sentiment_score: Mapped[float] = mapped_column(Float, default=0.0)
    urgency: Mapped[str] = mapped_column(String(20), default="medium")
    priority: Mapped[str | None] = mapped_column(String(20), nullable=True)
    category: Mapped[str] = mapped_column(String(100), default="General")
    tags: Mapped[list] = mapped_column(JSON, default=list)
    theme_ids: Mapped[list] = mapped_column(JSON, default=list)
    assigned_to: Mapped[str | None] = mapped_column(String(255), nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    suggested_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    product_area: Mapped[str | None] = mapped_column(String(100), nullable=True)
    themes: Mapped[list] = mapped_column(JSON, default=list)
    issues: Mapped[list] = mapped_column(JSON, default=list)
    keywords: Mapped[list] = mapped_column(JSON, default=list)
    feature_request: Mapped[bool] = mapped_column(Boolean, default=False)
    churn_signal: Mapped[bool] = mapped_column(Boolean, default=False)
    ai_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    ai_analyzed: Mapped[bool] = mapped_column(Boolean, default=True)

    # Memory tracking
    memory_retained: Mapped[bool] = mapped_column(Boolean, default=False)
    memory_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)

    # Lifecycle
    status: Mapped[str] = mapped_column(String(50), default="new")
    release_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("releases.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)

    workspace: Mapped["Workspace | None"] = relationship(back_populates="feedback")
    release: Mapped["Release | None"] = relationship(back_populates="feedback")


# ── Release ────────────────────────────────────────────────────────────────────

class Release(Base):
    __tablename__ = "releases"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    workspace_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("workspaces.id"), nullable=True, index=True)
    version: Mapped[str] = mapped_column(String(50))
    title: Mapped[str] = mapped_column(String(255))
    summary: Mapped[str] = mapped_column(Text, default="")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    features_shipped: Mapped[list] = mapped_column(JSON, default=list)
    roadmap_item_ids: Mapped[list] = mapped_column(JSON, default=list)
    target_areas: Mapped[list] = mapped_column(JSON, default=list)
    shipped_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    release_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    impact_status: Mapped[str] = mapped_column(String(20), default="pending")
    pre_release_sentiment: Mapped[float] = mapped_column(Float, default=0.0)
    post_release_sentiment: Mapped[float] = mapped_column(Float, default=0.0)
    sentiment_delta: Mapped[float] = mapped_column(Float, default=0.0)
    resolution_rate: Mapped[float] = mapped_column(Float, default=0.0)
    retained_insights: Mapped[list] = mapped_column(JSON, default=list)
    sentiment_before: Mapped[float | None] = mapped_column(Float, nullable=True)
    sentiment_after: Mapped[float | None] = mapped_column(Float, nullable=True)
    issue_volume_before: Mapped[int | None] = mapped_column(Integer, nullable=True)
    issue_volume_after: Mapped[int | None] = mapped_column(Integer, nullable=True)
    key_insights: Mapped[list] = mapped_column(JSON, default=list)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    workspace: Mapped["Workspace | None"] = relationship(back_populates="releases")
    feedback: Mapped[list["Feedback"]] = relationship(back_populates="release")
    actions: Mapped[list["Action"]] = relationship(back_populates="release")


# ── Action ─────────────────────────────────────────────────────────────────────

class Action(Base):
    __tablename__ = "actions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    workspace_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("workspaces.id"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    action_type: Mapped[str] = mapped_column(String(50), default="linear_issue")
    target_system: Mapped[str] = mapped_column(String(50), default="Linear")
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    execution_result: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    priority: Mapped[str] = mapped_column(String(20), default="medium")
    status: Mapped[str] = mapped_column(String(30), default="pending")
    owner: Mapped[str | None] = mapped_column(String(255), nullable=True)
    due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    product_area: Mapped[str | None] = mapped_column(String(100), nullable=True)
    impacted_users: Mapped[int] = mapped_column(Integer, default=0)
    linked_feedback_ids: Mapped[list] = mapped_column(JSON, default=list)
    insight_cluster_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    roadmap_item_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    insight_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    issue_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    release_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("releases.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)

    workspace: Mapped["Workspace | None"] = relationship(back_populates="actions")
    release: Mapped["Release | None"] = relationship(back_populates="actions")


# ── Insight ────────────────────────────────────────────────────────────────────

class Insight(Base):
    __tablename__ = "insights"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    workspace_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("workspaces.id"), nullable=True, index=True)
    theme: Mapped[str] = mapped_column(String(100), default="General")
    category: Mapped[str] = mapped_column(String(100), default="Emerging Trends")
    title: Mapped[str] = mapped_column(String(500))
    description: Mapped[str] = mapped_column(Text, default="")
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    evidence: Mapped[str | None] = mapped_column(Text, nullable=True)
    sentiment_distribution: Mapped[dict] = mapped_column(JSON, default=dict)
    urgency: Mapped[str] = mapped_column(String(20), default="medium")
    feedback_count: Mapped[int] = mapped_column(Integer, default=0)
    impact_score: Mapped[float] = mapped_column(Float, default=0.0)
    mrr_at_risk: Mapped[float] = mapped_column(Float, default=0.0)
    affected_tier_counts: Mapped[dict] = mapped_column(JSON, default=dict)
    trend_delta: Mapped[float] = mapped_column(Float, default=0.0)
    sample_quotes: Mapped[list] = mapped_column(JSON, default=list)
    related_feedback_ids: Mapped[list] = mapped_column(JSON, default=list)
    suggested_actions: Mapped[list] = mapped_column(JSON, default=list)
    hindsight_memory_refs: Mapped[list] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String(50), default="active")
    mentions: Mapped[int] = mapped_column(Integer, default=0)
    change_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    impact: Mapped[str] = mapped_column(String(20), default="medium")
    themes: Mapped[list] = mapped_column(JSON, default=list)
    sources: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)

    workspace: Mapped["Workspace | None"] = relationship(back_populates="insights")


# ── MemoryItem (Hindsight Agent Persistent Memory) ────────────────────────────

class MemoryItem(Base):
    __tablename__ = "memory_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    bank_id: Mapped[str] = mapped_column(String(100), default="default", index=True)
    memory_type: Mapped[str] = mapped_column(String(50), default="observation")
    content: Mapped[str] = mapped_column(Text)
    importance_score: Mapped[float] = mapped_column(Float, default=0.8)
    access_count: Mapped[int] = mapped_column(Integer, default=0)
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)
    last_accessed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)


# ── RoadmapItem ────────────────────────────────────────────────────────────────

class RoadmapItem(Base):
    __tablename__ = "roadmap_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    workspace_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="backlog")
    priority: Mapped[str] = mapped_column(String(20), default="medium")
    impact_score: Mapped[float] = mapped_column(Float, default=0.0)
    effort_estimate: Mapped[str | None] = mapped_column(String(10), default="M")
    target_release: Mapped[str | None] = mapped_column(String(50), nullable=True)
    insight_cluster_ids: Mapped[list] = mapped_column(JSON, default=list)
    linked_feedback_ids: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)


# ── ProcessingJob ──────────────────────────────────────────────────────────────

class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    workspace_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("workspaces.id"), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(50), default="queued")  # queued, processing, completed, failed
    source: Mapped[str] = mapped_column(String(50), default="upload")
    total: Mapped[int] = mapped_column(Integer, default=0)
    processed: Mapped[int] = mapped_column(Integer, default=0)
    failed: Mapped[int] = mapped_column(Integer, default=0)
    retained_count: Mapped[int] = mapped_column(Integer, default=0)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)


# ── DataSource ─────────────────────────────────────────────────────────────────

class DataSource(Base):
    __tablename__ = "data_sources"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    workspace_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("workspaces.id"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    source_type: Mapped[str] = mapped_column(String(50))  # app_store, google_play, zendesk, intercom, twitter, csv, manual
    status: Mapped[str] = mapped_column(String(30), default="connected")  # connected, syncing, idle, error
    item_count: Mapped[int] = mapped_column(Integer, default=0)
    last_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    config_json: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)


# ── Model Aliases for Schema Compatibility ────────────────────────────────────

FeedbackItem = Feedback
InsightCluster = Insight
ActionItem = Action
ReleaseLog = Release


