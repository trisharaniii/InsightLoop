import pytest

def test_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "pm@insightloop.ai", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "pm@insightloop.ai"


def test_login_failure(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "pm@insightloop.ai", "password": "wrongpassword"}
    )
    assert response.status_code == 401


def test_signup_workspace_isolation(client):
    user_data = {
        "email": "newpm@fintechpay.com",
        "full_name": "Jordan Lee",
        "password": "securepassword123",
        "role": "product_manager",
        "workspace_name": "FintechPay Workspace"
    }
    response = client.post("/api/v1/auth/signup", json=user_data)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newpm@fintechpay.com"
    assert data["workspace_id"] is not None

    # Login with new user
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "newpm@fintechpay.com", "password": "securepassword123"}
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # Verify /me endpoint
    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "newpm@fintechpay.com"
