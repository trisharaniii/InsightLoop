import pytest

def test_list_feedback(client):
    response = client.get("/api/v1/feedback")
    assert response.status_code == 200
    items = response.json()
    assert isinstance(items, list)
    assert len(items) >= 50


def test_filter_feedback_by_source_and_urgency(client):
    response = client.get("/api/v1/feedback?urgency=critical")
    assert response.status_code == 200
    items = response.json()
    assert len(items) > 0
    for item in items:
        assert item["urgency"] == "critical"


def test_create_feedback_triggers_ai_and_memory(client):
    payload = {
        "content": "UPI payment failed twice while transferring ₹5,000.",
        "source": "app_store",
        "customer_name": "Rohan Mehta",
        "customer_email": "rohan@gmail.com",
        "customer_tier": "pro",
        "rating": 1.0
    }
    response = client.post("/api/v1/feedback", json=payload)
    assert response.status_code == 201
    item = response.json()
    assert item["id"] is not None
    assert item["sentiment"] == "negative"
    assert item["sentiment_score"] < 0
    assert item["urgency"] in ["critical", "high"]
    assert item["product_area"] == "Payments & Checkout"
    assert item["memory_retained"] is True
    assert item["memory_id"] is not None


def test_get_feedback_detail_with_memories(client):
    list_res = client.get("/api/v1/feedback?limit=1")
    assert list_res.status_code == 200
    fb_id = list_res.json()[0]["id"]

    detail_res = client.get(f"/api/v1/feedback/{fb_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == fb_id
    assert "related_feedback" in detail
    assert "relevant_memories" in detail
