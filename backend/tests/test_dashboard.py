import pytest

def test_dashboard_summary_metrics(client):
    response = client.get("/api/v1/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_feedback"] >= 50
    assert data["ai_analyzed"] >= 50
    assert "sentiment_score" in data
    assert "critical_issues" in data
    assert "top_themes" in data
    assert "emerging_issues" in data
    assert "recent_insights" in data
    assert "recent_actions" in data


def test_unified_search(client):
    response = client.get("/api/v1/search?q=payment")
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "payment"
    assert "feedback" in data
    assert "insights" in data
    assert "releases" in data
    assert "actions" in data
    assert "memory" in data


def test_data_sources_list(client):
    response = client.get("/api/v1/sources")
    assert response.status_code == 200
    sources = response.json()
    assert isinstance(sources, list)
    assert len(sources) >= 5


def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "hindsight" in data
