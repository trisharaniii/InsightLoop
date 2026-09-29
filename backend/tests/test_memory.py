import pytest

def test_list_memories(client):
    response = client.get("/api/v1/memory?bank_id=default")
    assert response.status_code == 200
    memories = response.json()
    assert isinstance(memories, list)
    assert len(memories) > 0


def test_retain_memory(client):
    payload = {
        "bank_id": "default",
        "content": "[OBSERVATION] Customer complaints regarding UPI checkout failure in v2.4.0",
        "memory_type": "observation",
        "metadata": {"theme": "Payments", "source": "Zendesk"},
        "importance_score": 0.92
    }
    response = client.post("/api/v1/memory/retain", json=payload)
    assert response.status_code == 201
    mem = response.json()
    assert mem["id"] is not None
    assert mem["content"] == payload["content"]
    assert mem["memory_type"] == "observation"
    assert mem["importance_score"] == 0.92


def test_recall_memory(client):
    query = {"query": "Why are customers unhappy with payments?", "bank_id": "default", "top_k": 5}
    response = client.post("/api/v1/memory/recall", json=query)
    assert response.status_code == 200
    data = response.json()
    assert "memories" in data
    assert "related_feedback" in data
    assert "issues" in data
    assert "themes" in data
    assert len(data["memories"]) > 0


def test_memory_chat_reasoning(client):
    payload = {
        "query": "Why did negative sentiment increase this month?",
        "bank_id": "default",
        "compare_mode": False
    }
    response = client.post("/api/v1/memory/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "evidence" in data
    assert "related_themes" in data
    assert "related_issues" in data
    assert "confidence" in data
    assert data["confidence"] > 0.5


def test_recurring_issue_detection(client):
    response = client.get("/api/v1/memory/recurring-issues")
    assert response.status_code == 200
    issues = response.json()
    assert isinstance(issues, list)
    assert len(issues) >= 3

    # Verify payment issue metrics
    payment_issue = next((i for i in issues if "Payment" in i["title"]), None)
    assert payment_issue is not None
    assert payment_issue["historical_mentions"] > 0
    assert payment_issue["urgency"] == "critical"
    assert payment_issue["confidence"] >= 0.85


def test_compare_without_vs_with_memory(client):
    response = client.get("/api/v1/memory/compare?query=UPI%20payment%20failed")
    assert response.status_code == 200
    data = response.json()
    assert "without_memory" in data
    assert "with_hindsight" in data
    assert "evidence" in data
    assert data["without_memory"] is not None
    assert data["with_hindsight"] is not None


def test_memory_reflect_and_discover(client):
    reflect_res = client.post(
        "/api/v1/memory/reflect",
        json={"question": "What are our systemic reliability bottlenecks?", "bank_id": "default"}
    )
    assert reflect_res.status_code == 200
    reflect_data = reflect_res.json()
    assert "synthesis" in reflect_data

    discover_res = client.get("/api/v1/memory/discover?bank_id=default")
    assert discover_res.status_code == 200
    disc_data = discover_res.json()
    assert "discovered_patterns" in disc_data
    assert len(disc_data["discovered_patterns"]) > 0
