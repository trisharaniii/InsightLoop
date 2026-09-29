"""
Hindsight Service bridge: exports the unified hindsight_service and memory_service
instances to keep Hindsight isolated behind the memory service abstraction.
"""
from app.memory.hindsight import hindsight_service, HindsightMemoryService
from app.services.memory_service import memory_service, MemoryService

__all__ = ["hindsight_service", "HindsightMemoryService", "memory_service", "MemoryService"]
