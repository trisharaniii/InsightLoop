import pytest

def test_complete_hindsight_memory_e2e_loop(client):
    """
    Complete InsightLoop Core Technical Story:
    RETAIN -> RECALL -> REASON -> ACT -> VERIFY
    Demonstrating the full 12-step journey!
    """

    # ─────────────────────────────────────────────────────────────
    # STEP 1 & 2: Ingest feedback and run AI Analysis
    # ─────────────────────────────────────────────────────────────
    feedback_payload = {
        "content": "UPI payment failed twice while transferring ₹5,000 to my vendor.",
        "source": "app_store",
        "customer_name": "Kavita Reddy",
        "customer_email": "kavita@reddy.io",
        "customer_tier": "enterprise",
        "rating": 1.0
    }
    fb_res = client.post("/api/v1/feedback", json=feedback_payload)
    assert fb_res.status_code == 201
    fb_data = fb_res.json()
    assert fb_data["sentiment"] == "negative"
    assert fb_data["urgency"] == "critical"
    assert fb_data["product_area"] == "Payments & Checkout"

    # ─────────────────────────────────────────────────────────────
    # STEP 3: Backend retains meaningful info in Hindsight
    # ─────────────────────────────────────────────────────────────
    assert fb_data["memory_retained"] is True
    assert fb_data["memory_id"] is not None

    # Verify memory exists in Hindsight bank
    memories_res = client.get("/api/v1/memory?bank_id=default")
    assert memories_res.status_code == 200
    all_memories = memories_res.json()
    assert any("UPI payment failed" in m["content"] for m in all_memories)

    # ─────────────────────────────────────────────────────────────
    # STEP 4 & 5: Ask "Have customers complained about this before?" -> Hindsight recalls
    # ─────────────────────────────────────────────────────────────
    recall_payload = {
        "query": "Have customers complained about UPI payment failure before?",
        "bank_id": "default",
        "top_k": 5
    }
    recall_res = client.post("/api/v1/memory/recall", json=recall_payload)
    assert recall_res.status_code == 200
    recall_data = recall_res.json()
    assert len(recall_data["memories"]) > 0
    assert any("UPI payment failed" in m["content"] or "Payments" in str(m) for m in recall_data["memories"])

    # ─────────────────────────────────────────────────────────────
    # STEP 6 & 7: Ask "How serious is this problem?" -> Reasons over current + historical memory
    # ─────────────────────────────────────────────────────────────
    chat_payload = {
        "query": "How serious is this payment problem across historical customer reports?",
        "bank_id": "default",
        "compare_mode": True
    }
    chat_res = client.post("/api/v1/memory/chat", json=chat_payload)
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert "answer" in chat_data
    assert "evidence" in chat_data
    assert len(chat_data["evidence"]) > 0
    assert chat_data["confidence"] >= 0.85
    assert chat_data["without_memory_answer"] is not None

    # Check recurring issue detection
    recurring_res = client.get("/api/v1/memory/recurring-issues")
    assert recurring_res.status_code == 200
    recurring_issues = recurring_res.json()
    payment_issue = next((i for i in recurring_issues if "Payment" in i["title"]), None)
    assert payment_issue is not None
    assert payment_issue["historical_mentions"] >= 1000
    assert payment_issue["urgency"] == "critical"

    # ─────────────────────────────────────────────────────────────
    # STEP 8: Create an action in Action Hub
    # ─────────────────────────────────────────────────────────────
    action_payload = {
        "title": "Investigate payment gateway timeout and retry handling",
        "description": "UPI transfers fail with PG-504 gateway timeout. Fix timeout configuration.",
        "priority": "P0",
        "status": "In Progress",
        "owner": "Sarah Chen",
        "target_system": "Linear",
        "product_area": "Payments & Checkout"
    }
    act_res = client.post("/api/v1/actions", json=action_payload)
    assert act_res.status_code == 201
    action_data = act_res.json()
    assert action_data["id"] is not None
    assert action_data["status"] == "In Progress"

    # ─────────────────────────────────────────────────────────────
    # STEP 9: Create release v2.4.1 targeting payment issues
    # ─────────────────────────────────────────────────────────────
    release_payload = {
        "version": "v2.4.1",
        "title": "Payment Gateway Hotfix & Retry Optimization",
        "summary": "Fix for UPI payment gateway timeouts.",
        "features_shipped": ["UPI Gateway Retry Optimization", "SMS Carrier Fallback"],
        "target_areas": ["Payments & Checkout"]
    }
    rel_res = client.post("/api/v1/releases", json=release_payload)
    assert rel_res.status_code == 201
    release_data = rel_res.json()
    rel_id = release_data["id"]

    # ─────────────────────────────────────────────────────────────
    # STEP 10: Ingest post-release feedback
    # ─────────────────────────────────────────────────────────────
    post_fb_payload = {
        "content": "Payments are now super smooth and instant! Great job on the fix.",
        "source": "app_store",
        "customer_name": "Vikram Seth",
        "customer_tier": "pro",
        "rating": 5.0
    }
    post_fb_res = client.post("/api/v1/feedback", json=post_fb_payload)
    assert post_fb_res.status_code == 201
    assert post_fb_res.json()["sentiment"] == "positive"

    # ─────────────────────────────────────────────────────────────
    # STEP 11 & 12: Run Impact Verification & Show complaints decreased!
    # ─────────────────────────────────────────────────────────────
    verify_res = client.post(f"/api/v1/releases/{rel_id}/verify")
    assert verify_res.status_code == 200
    verification = verify_res.json()
    assert verification["verified"] is True
    assert verification["result"] == "Improved"
    assert verification["volume_after"] < verification["volume_before"]
    assert "retained_hindsight_memory_id" in verification
    assert "retained_memory_content" in verification

    # Check release impact summary
    impact_res = client.get(f"/api/v1/releases/{rel_id}/impact")
    assert impact_res.status_code == 200
    impact_data = impact_res.json()
    assert impact_data["outcome"] == "Improved"
    assert "decreased" in impact_data["claim_statement"]
