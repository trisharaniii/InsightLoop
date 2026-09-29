import pytest

def test_list_releases(client):
    response = client.get("/api/v1/releases")
    assert response.status_code == 200
    releases = response.json()
    assert isinstance(releases, list)
    assert len(releases) >= 8


def test_create_release(client):
    payload = {
        "version": "v2.5.0",
        "title": "Zero-Latency Payment Engine",
        "summary": "Full overhaul of payment worker queues and Redis caching layer.",
        "features_shipped": ["Async UPI Webhook Routing", "Redis Cluster Caching", "Instant Push Alerts"],
        "target_areas": ["Payments & Checkout", "Performance & API"]
    }
    response = client.post("/api/v1/releases", json=payload)
    assert response.status_code == 201
    rel = response.json()
    assert rel["id"] is not None
    assert rel["version"] == "v2.5.0"


def test_get_release_impact(client):
    # Fetch first release
    list_res = client.get("/api/v1/releases")
    assert list_res.status_code == 200
    first_rel = list_res.json()[0]

    impact_res = client.get(f"/api/v1/releases/{first_rel['id']}/impact")
    assert impact_res.status_code == 200
    impact = impact_res.json()
    assert "issue_volume_before" in impact
    assert "issue_volume_after" in impact
    assert "percentage_change" in impact
    assert "claim_statement" in impact
    assert "historical_evidence" in impact


def test_verify_release_impact_pipeline(client):
    # Fetch first release
    list_res = client.get("/api/v1/releases")
    assert list_res.status_code == 200
    rel_id = list_res.json()[0]["id"]

    verify_res = client.post(f"/api/v1/releases/{rel_id}/verify")
    assert verify_res.status_code == 200
    verification = verify_res.json()
    assert verification["verified"] is True
    assert verification["result"] in ["Improved", "Unchanged", "Needs Monitoring"]
    assert "retained_hindsight_memory_id" in verification
    assert "retained_memory_content" in verification
