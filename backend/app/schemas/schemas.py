from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ── Auth & Users ─────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "product_manager"  # admin, product_manager, analyst, viewer


class UserCreate(UserBase):
    password: str
    workspace_name: Optional[str] = "Acme Fintech"


class UserResponse(UserBase):
    id: str
    workspace_id: Optional[str] = None
    avatar: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Feedback Items ───────────────────────────────────────────────────────────

class FeedbackBase(BaseModel):
    source: str  # App Store, Google Play, Zendesk, Intercom, Twitter/X, Survey, CSV Upload, Manual
    external_id: Optional[str] = None
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_tier: Optional[str] = "free"  # free, pro, enterprise
    customer_segment: Optional[str] = None
    customer_role: Optional[str] = None
    rating: Optional[float] = None
    content: str
    product_area: Optional[str] = None
    category: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class FeedbackCreate(FeedbackBase):
    pass


class FeedbackUpdate(BaseModel):
    sentiment: Optional[str] = None
    urgency: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    tags: Optional[List[str]] = None
    product_area: Optional[str] = None


class FeedbackResponse(BaseModel):
    id: str
    workspace_id: Optional[str] = None
    source: str
    external_id: Optional[str] = None
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_tier: Optional[str] = "free"
    customer_segment: Optional[str] = None
    customer_role: Optional[str] = None
    content: str
    rating: Optional[float] = None

    # AI Analysis fields
    sentiment: str = "neutral"
    sentiment_score: float = 0.0
    urgency: str = "medium"
    priority: Optional[str] = "P2"
    summary: Optional[str] = None
    product_area: Optional[str] = None
    category: Optional[str] = "General"
    tags: List[str] = []
    themes: List[str] = []
    issues: List[str] = []
    feature_request: bool = False
    churn_signal: bool = False
    ai_confidence: Optional[float] = None
    ai_analyzed: bool = True

    # Memory tracking
    memory_retained: bool = False
    memory_id: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None

    # Lifecycle
    status: str = "new"
    release_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FeedbackDetailResponse(FeedbackResponse):
    related_feedback: List[FeedbackResponse] = []
    relevant_memories: List[Dict[str, Any]] = []


class FeedbackFilter(BaseModel):
    source: Optional[str] = None
    sentiment: Optional[str] = None
    urgency: Optional[str] = None
    priority: Optional[str] = None
    customer_tier: Optional[str] = None
    theme: Optional[str] = None
    product_area: Optional[str] = None
    search: Optional[str] = None
    status: Optional[str] = None
    release_id: Optional[str] = None
    date_range: Optional[str] = None
    limit: int = 100
    offset: int = 0


# ── Hindsight Memory ──────────────────────────────────────────────────────────

class HindsightMemoryRetainRequest(BaseModel):
    bank_id: str = "default"
    content: str
    metadata: Optional[Dict[str, Any]] = None
    memory_type: str = "observation"  # observation, theme_cluster, decision, release_outcome, impact_verification
    importance_score: float = 0.8


class HindsightRecallQuery(BaseModel):
    bank_id: str = "default"
    query: str
    top_k: int = 5
    memory_types: Optional[List[str]] = None


class MemoryItemResponse(BaseModel):
    id: str
    bank_id: str
    memory_type: str
    content: str
    importance_score: float
    access_count: int
    metadata: Optional[Dict[str, Any]] = Field(default=None, alias="metadata_json")
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        populate_by_name = True


class HindsightReflectRequest(BaseModel):
    bank_id: str = "default"
    question: str
    context_filters: Optional[Dict[str, Any]] = None


class MemoryRecallRequest(BaseModel):
    query: str
    bank_id: str = "default"
    top_k: int = 5
    memory_types: Optional[List[str]] = None


class MemoryRecallResponse(BaseModel):
    query: str
    bank_id: str = "default"
    memories: List[Dict[str, Any]] = []
    related_feedback: List[Dict[str, Any]] = []
    issues: List[str] = []
    themes: List[str] = []
    releases: List[Dict[str, Any]] = []
    evidence: List[Dict[str, Any]] = []
    confidence: float = 0.90
    explanation: str = "This issue has appeared across multiple feedback sources over time."


class MemoryChatRequest(BaseModel):
    query: str
    bank_id: str = "default"
    compare_mode: bool = False


class MemoryChatResponse(BaseModel):
    answer: str
    without_memory_answer: Optional[str] = None
    evidence: List[Dict[str, Any]] = []
    related_themes: List[str] = []
    related_issues: List[str] = []
    confidence: float = 0.90
    sources: List[str] = []


class RecurringIssueResponse(BaseModel):
    id: str
    title: str
    category: str
    historical_mentions: int
    current_trend: str
    urgency: str
    confidence: float
    sources: List[str]
    sample_quote: str
    status: str
    mrr_at_risk: float


# ── AI Insights ───────────────────────────────────────────────────────────────

class InsightClusterResponse(BaseModel):
    id: str
    workspace_id: Optional[str] = None
    theme: str
    category: str
    title: str
    description: str
    explanation: Optional[str] = None
    evidence: Optional[str] = None
    sentiment_distribution: Dict[str, int] = {}
    urgency: str = "medium"
    feedback_count: int = 0
    impact_score: float = 0.0
    mrr_at_risk: float = 0.0
    affected_tier_counts: Dict[str, int] = {}
    trend_delta: float = 0.0
    sample_quotes: List[str] = []
    related_feedback_ids: List[str] = []
    suggested_actions: List[str] = []
    hindsight_memory_refs: List[str] = []
    status: str = "active"
    mentions: int = 0
    change_pct: Optional[float] = None
    confidence: Optional[float] = None
    impact: str = "medium"
    themes: List[str] = []
    sources: List[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InsightGenerateResponse(BaseModel):
    total_insights: int
    insights: List[InsightClusterResponse]
    synthesized_from_memories_count: int


# ── Release Intelligence ────────────────────────────────────────────────────────

class ReleaseLogCreate(BaseModel):
    version: str
    title: str
    summary: Optional[str] = ""
    description: Optional[str] = None
    features_shipped: List[str] = []
    target_areas: List[str] = []
    roadmap_item_ids: List[str] = []


class ReleaseLogResponse(BaseModel):
    id: str
    workspace_id: Optional[str] = None
    version: str
    title: str
    summary: Optional[str] = ""
    description: Optional[str] = None
    features_shipped: List[str] = []
    target_areas: List[str] = []
    shipped_at: datetime
    release_date: datetime
    impact_status: str = "pending"
    pre_release_sentiment: float = 0.0
    post_release_sentiment: float = 0.0
    sentiment_delta: float = 0.0
    resolution_rate: float = 0.0
    sentiment_before: Optional[float] = None
    sentiment_after: Optional[float] = None
    issue_volume_before: Optional[int] = None
    issue_volume_after: Optional[int] = None
    key_insights: List[str] = []
    notes: Optional[str] = None
    verified: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class ReleaseImpactResponse(BaseModel):
    release_id: str
    version: str
    title: str
    shipped_at: Optional[str] = None
    issue_volume_before: int
    issue_volume_after: int
    percentage_change: str
    sentiment_before: float
    sentiment_after: float
    sentiment_delta: float
    verified: bool
    outcome: str
    claim_statement: str
    historical_evidence: List[str] = []


class ReleaseVerifyResponse(BaseModel):
    release_id: str
    version: str
    result: str  # Improved, Unchanged, Needs Monitoring
    volume_before: int
    volume_after: int
    change_pct: str
    verified: bool
    retained_hindsight_memory_id: Optional[str] = None
    retained_memory_content: Optional[str] = None


# ── Action Hub ─────────────────────────────────────────────────────────────────

class ActionItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    action_type: str = "linear_issue"  # linear_issue, jira_ticket, slack_notify, roadmap_update
    target_system: str = "Linear"
    priority: str = "P1"  # P0, P1, P2, P3
    status: str = "Open"  # Open, Investigating, In Progress, Completed, Verified
    owner: Optional[str] = None
    due_date: Optional[datetime] = None
    product_area: Optional[str] = None
    insight_id: Optional[str] = None
    insight_cluster_id: Optional[str] = None
    issue_id: Optional[str] = None
    release_id: Optional[str] = None
    payload: Dict[str, Any] = {}
    roadmap_item_id: Optional[str] = None
    linked_feedback_ids: List[str] = []


class ActionItemCreate(ActionItemBase):
    pass


class ActionItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None  # Open, Investigating, In Progress, Completed, Verified
    owner: Optional[str] = None
    due_date: Optional[datetime] = None
    release_id: Optional[str] = None


class ActionItemResponse(ActionItemBase):
    id: str
    workspace_id: Optional[str] = None
    execution_result: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Roadmap Items ────────────────────────────────────────────────────────────

class RoadmapItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "backlog"
    priority: str = "medium"
    impact_score: float = 0.0
    effort_estimate: Optional[str] = "M"
    target_release: Optional[str] = None
    insight_cluster_ids: List[str] = []
    linked_feedback_ids: List[str] = []


class RoadmapItemCreate(RoadmapItemBase):
    pass


class RoadmapItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    impact_score: Optional[float] = None
    effort_estimate: Optional[str] = None
    target_release: Optional[str] = None
    insight_cluster_ids: Optional[List[str]] = None
    linked_feedback_ids: Optional[List[str]] = None


class RoadmapItemResponse(RoadmapItemBase):
    id: str
    workspace_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Ingestion & Jobs ──────────────────────────────────────────────────────────

class BatchIngestRequest(BaseModel):
    source: str = "csv_upload"
    items: List[FeedbackCreate]


class IngestStatusResponse(BaseModel):
    job_id: str
    batch_id: Optional[str] = None
    status: str = "completed"
    total: int = 0
    processed: int = 0
    failed: int = 0
    retained_in_hindsight: int = 0
    insights_generated: int = 0


class ProcessingJobResponse(BaseModel):
    job_id: str
    status: str  # queued, processing, completed, failed
    total: int
    processed: int
    failed: int
    retained_count: int
    source: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Unified Search ────────────────────────────────────────────────────────────

class UnifiedSearchResponse(BaseModel):
    query: str
    feedback: List[FeedbackResponse] = []
    themes: List[str] = []
    issues: List[str] = []
    insights: List[InsightClusterResponse] = []
    releases: List[ReleaseLogResponse] = []
    actions: List[ActionItemResponse] = []
    memory: List[MemoryItemResponse] = []


class SearchQuery(BaseModel):
    query: str
    include_hindsight_memory: bool = True
    top_k: int = 5


class AgentReasoningResponse(BaseModel):
    query: str
    answer: str
    confidence_score: float
    recalled_memories: List[Dict[str, Any]] = []
    supporting_feedback: List[FeedbackResponse] = []
    suggested_next_steps: List[str] = []


# ── Data Sources ──────────────────────────────────────────────────────────────

class DataSourceResponse(BaseModel):
    id: str
    name: str
    source_type: str
    status: str
    item_count: int
    last_synced_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Dashboard Summary ─────────────────────────────────────────────────────────

class DashboardSummaryResponse(BaseModel):
    total_feedback: int
    ai_analyzed: int
    sentiment_score: float
    critical_issues: int
    feature_requests: int
    sentiment_trend: List[Dict[str, Any]] = []
    feedback_volume: List[Dict[str, Any]] = []
    top_themes: List[Dict[str, Any]] = []
    emerging_issues: List[Dict[str, Any]] = []
    recent_insights: List[Dict[str, Any]] = []
    recent_actions: List[Dict[str, Any]] = []
    recent_activity: List[Dict[str, Any]] = []
    hindsight_memories_count: int = 0
