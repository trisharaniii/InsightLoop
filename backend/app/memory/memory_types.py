from enum import Enum
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class MemoryType(str, Enum):
    OBSERVATION = "observation"
    THEME_CLUSTER = "theme_cluster"
    RECURRING_ISSUE = "recurring_issue"
    DECISION = "decision"
    RELEASE_OUTCOME = "release_outcome"
    IMPACT_VERIFICATION = "impact_verification"


class MemoryRecord(BaseModel):
    id: str
    bank_id: str = "default"
    memory_type: MemoryType = MemoryType.OBSERVATION
    content: str
    importance_score: float = 0.8
    access_count: int = 0
    metadata: Dict[str, Any] = Field(default_factory=dict)
