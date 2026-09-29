import pytest

def test_get_insights(client):
    response = client.get("/api/v1/insights")
    assert response.status_code == 200
    insights = response.json()
    assert isinstance(insights, list)
    assert len(insights) >= 5


def test_generate_insights_synthesis(client):
    response = client.post("/api/v1/insights/generate")
    assert response.status_code == 200
    insights = response.json()
    assert isinstance(insights, list)
    assert len(insights) > 0

    first = insights[0]
    assert "title" in first
    assert "theme" in first
    assert "impact_score" in first
