import pytest

def test_list_actions(client):
    response = client.get("/api/v1/actions")
    assert response.status_code == 200
    actions = response.json()
    assert isinstance(actions, list)
    assert len(actions) >= 10


def test_create_action_hub_item(client):
    payload = {
        "title": "Investigate payment gateway timeout and retry handling",
        "description": "UPI transfers above ₹5,000 frequently fail with PG-504 timeout.",
        "priority": "P0",
        "status": "Investigating",
        "owner": "Sarah Chen",
        "target_system": "Linear",
        "product_area": "Payments & Checkout"
    }
    response = client.post("/api/v1/actions", json=payload)
    assert response.status_code == 201
    act = response.json()
    assert act["id"] is not None
    assert act["title"] == payload["title"]
    assert act["status"] == "Investigating"


def test_patch_action_status_transition(client):
    list_res = client.get("/api/v1/actions")
    assert list_res.status_code == 200
    act_id = list_res.json()[0]["id"]

    patch_res = client.patch(f"/api/v1/actions/{act_id}", json={"status": "In Progress"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "In Progress"
