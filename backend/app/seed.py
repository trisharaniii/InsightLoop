import uuid
import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session

from app.models.models import (
    Workspace, User, FeedbackItem, InsightCluster, MemoryItem,
    RoadmapItem, ActionItem, Release, DataSource
)
from app.core.security import get_password_hash
from app.memory.hindsight import hindsight_service

logger = logging.getLogger("insightloop.seed")


def seed_initial_database(db: Session, force: bool = False):
    """
    Seed initial realistic fintech demo dataset into InsightLoop database.
    Requires at least:
    - 50 feedback records
    - 20 themes
    - 15 issues
    - 8 releases
    - 10 insights
    - 10 actions
    - Populated persistent Hindsight memory entries for instant recall & demo.
    """
    if not force and db.query(FeedbackItem).count() >= 50:
        logger.info("Database already seeded with 50+ feedback records. Skipping initial seed.")
        return

    logger.info("Seeding realistic fintech intelligence dataset & persistent Hindsight memories...")

    # 1. Seed Workspace
    workspace = db.query(Workspace).filter(Workspace.id == "ws-fintech-demo").first()
    if not workspace:
        workspace = Workspace(
            id="ws-fintech-demo",
            name="InsightFintech Core",
            description="Production feedback intelligence workspace for Acme Fintech & Payments"
        )
        db.add(workspace)
        db.commit()

    # 2. Seed Users
    users_data = [
        {"id": "user-pm-1", "email": "pm@insightloop.ai", "name": "Sarah Chen", "role": "product_manager"},
        {"id": "user-admin-1", "email": "admin@insightloop.ai", "name": "Alex Mercer", "role": "admin"},
        {"id": "user-analyst-1", "email": "analyst@insightloop.ai", "name": "Priya Sharma", "role": "analyst"},
        {"id": "user-lead-1", "email": "lead@insightloop.ai", "name": "Marcus Vance", "role": "head_of_product"},
    ]
    for u in users_data:
        if not db.query(User).filter(User.email == u["email"]).first():
            user = User(
                id=u["id"],
                workspace_id=workspace.id,
                email=u["email"],
                hashed_password=get_password_hash("password123"),
                full_name=u["name"],
                role=u["role"],
                avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={u['email']}"
            )
            db.add(user)
    db.commit()

    # 3. Seed 8 Software Releases
    releases_data = [
        {
            "id": "rel-v2.4.1",
            "version": "v2.4.1",
            "title": "Payment Gateway Hotfix & Carrier SMS Fallback",
            "summary": "Direct fix for UPI payment timeouts and Twilio secondary carrier routing for 2FA.",
            "description": "Engineered gateway retry timeouts from 30s down to 5s, added instant transaction status polling, and fixed biometric authentication exception on Android 14.",
            "features_shipped": ["UPI Gateway Retry Optimization", "SMS Carrier Fallback", "Android 14 Biometric Fix"],
            "target_areas": ["Payments & Checkout", "Authentication & Security"],
            "shipped_at": datetime.now(timezone.utc) - timedelta(days=2),
            "release_date": datetime.now(timezone.utc) - timedelta(days=2),
            "impact_status": "verified",
            "sentiment_before": -0.68,
            "sentiment_after": 0.76,
            "issue_volume_before": 1240,
            "issue_volume_after": 482,
            "key_insights": [
                "UPI payment failure reports dropped by 61% post-hotfix deployment.",
                "Android 14 biometric crash reports eliminated.",
                "Customer satisfaction sentiment rebounded from negative to positive."
            ],
            "verified": True
        },
        {
            "id": "rel-v2.4.0",
            "version": "v2.4.0",
            "title": "Checkout Flow Redesign & One-Click Pay",
            "summary": "Redesigned checkout modal with instant Apple Pay / Google Pay integration and simplified 2-step verification.",
            "description": "Major overhaul of payment checkout UI. Streamlined payment flow from 4 pages to 1 modal.",
            "features_shipped": ["One-Click Checkout", "Apple Pay Integration", "Google Pay Direct", "New Modal Design"],
            "target_areas": ["Payments & Checkout", "UI & Usability", "Performance & Speed"],
            "shipped_at": datetime.now(timezone.utc) - timedelta(days=12),
            "release_date": datetime.now(timezone.utc) - timedelta(days=12),
            "impact_status": "mixed",
            "sentiment_before": -0.42,
            "sentiment_after": 0.28,
            "issue_volume_before": 840,
            "issue_volume_after": 1240,
            "key_insights": [
                "Checkout completion rate surged +34% after one-click pay rollout.",
                "Regression: Unhandled gateway timeout caused UPI transaction pending states to double."
            ],
            "verified": True
        },
        {
            "id": "rel-v2.3.2",
            "version": "v2.3.2",
            "title": "Database Query Optimization & Caching",
            "summary": "Added Redis query caching for transaction history endpoints.",
            "description": "Reduced p95 API response times on transaction history and account balance views.",
            "features_shipped": ["Redis Layer 2 Cache", "Transaction Pagination", "Read Replica Routing"],
            "target_areas": ["Performance & Speed"],
            "shipped_at": datetime.now(timezone.utc) - timedelta(days=25),
            "release_date": datetime.now(timezone.utc) - timedelta(days=25),
            "impact_status": "positive",
            "sentiment_before": -0.30,
            "sentiment_after": 0.45,
            "issue_volume_before": 620,
            "issue_volume_after": 210,
            "key_insights": ["History load times reduced from 4.2s to 1.1s for accounts with <10k transactions."],
            "verified": True
        },
        {
            "id": "rel-v2.3.1",
            "version": "v2.3.1",
            "title": "CSV Export Streaming & High-Volume Triage",
            "summary": "Replaced in-memory CSV generation with chunked async file export to S3.",
            "description": "Resolves browser crash when exporting datasets exceeding 50,000 transactions.",
            "features_shipped": ["S3 Streaming Export", "Background Job Worker", "Export Progress Bar"],
            "target_areas": ["Performance & Speed", "Core Features"],
            "shipped_at": datetime.now(timezone.utc) - timedelta(days=38),
            "release_date": datetime.now(timezone.utc) - timedelta(days=38),
            "impact_status": "positive",
            "sentiment_before": -0.55,
            "sentiment_after": 0.62,
            "issue_volume_before": 340,
            "issue_volume_after": 45,
            "key_insights": ["Export crash complaints decreased by 87%."],
            "verified": True
        },
        {
            "id": "rel-v2.3.0",
            "version": "v2.3.0",
            "title": "OLED Pure Dark Mode & Accessibility Palette",
            "summary": "Native dark mode toggle with high-contrast accessibility compliant colors.",
            "description": "Customizable theme settings, OLED black background for mobile battery efficiency.",
            "features_shipped": ["Dark Mode Toggle", "Auto Theme Schedule", "High Contrast WCAG AA"],
            "target_areas": ["UI & Usability"],
            "shipped_at": datetime.now(timezone.utc) - timedelta(days=50),
            "release_date": datetime.now(timezone.utc) - timedelta(days=50),
            "impact_status": "positive",
            "sentiment_before": 0.15,
            "sentiment_after": 0.84,
            "issue_volume_before": 180,
            "issue_volume_after": 25,
            "key_insights": ["Highest customer satisfaction spike this year (+94% positive reviews)."],
            "verified": True
        },
        {
            "id": "rel-v2.2.1",
            "version": "v2.2.1",
            "title": "Explicit Billing Toggle & Refund Self-Service",
            "summary": "Fix for accidental annual billing defaults with self-service refund cancellation button.",
            "description": "Clarified pricing radio toggles and automated 7-day no-questions refund processing.",
            "features_shipped": ["Explicit Billing Radio", "Self-Serve Refund Button", "Invoice Preview"],
            "target_areas": ["Checkout & Billing"],
            "shipped_at": datetime.now(timezone.utc) - timedelta(days=68),
            "release_date": datetime.now(timezone.utc) - timedelta(days=68),
            "impact_status": "positive",
            "sentiment_before": -0.60,
            "sentiment_after": 0.35,
            "issue_volume_before": 550,
            "issue_volume_after": 95,
            "key_insights": ["Accidental charge dispute chargebacks dropped by 78%."],
            "verified": True
        },
        {
            "id": "rel-v2.2.0",
            "version": "v2.2.0",
            "title": "Subscription Tiers & Enterprise Seat Management",
            "summary": "Revamped plan pricing, team member role permissions, and annual billing discount.",
            "description": "Introduced Free, Pro, and Enterprise tiers with per-seat billing.",
            "features_shipped": ["Tiered Subscriptions", "Seat Management", "Annual Discount Banner"],
            "target_areas": ["Checkout & Billing"],
            "shipped_at": datetime.now(timezone.utc) - timedelta(days=82),
            "release_date": datetime.now(timezone.utc) - timedelta(days=82),
            "impact_status": "negative",
            "sentiment_before": 0.35,
            "sentiment_after": -0.58,
            "issue_volume_before": 120,
            "issue_volume_after": 550,
            "key_insights": ["Default annual billing toggle confused users, leading to customer churn spikes."],
            "verified": True
        },
        {
            "id": "rel-v2.1.0",
            "version": "v2.1.0",
            "title": "Multi-Currency Wallet & International FX Rates",
            "summary": "Support for USD, EUR, GBP, INR wallets with real-time exchange rates.",
            "description": "First international payments capability with real-time ECB foreign exchange feeds.",
            "features_shipped": ["Multi-Currency Balances", "Live FX Feed", "Cross-Border Transfer"],
            "target_areas": ["Payments & Checkout"],
            "shipped_at": datetime.now(timezone.utc) - timedelta(days=110),
            "release_date": datetime.now(timezone.utc) - timedelta(days=110),
            "impact_status": "mixed",
            "sentiment_before": 0.20,
            "sentiment_after": 0.42,
            "issue_volume_before": 90,
            "issue_volume_after": 140,
            "key_insights": ["High international adoption, but users requested instant notifications on rate locks."],
            "verified": True
        }
    ]

    for rel in releases_data:
        existing_rel = db.query(Release).filter(Release.id == rel["id"]).first()
        if not existing_rel:
            r = Release(
                id=rel["id"],
                workspace_id=workspace.id,
                version=rel["version"],
                title=rel["title"],
                summary=rel["summary"],
                description=rel["description"],
                features_shipped=rel["features_shipped"],
                target_areas=rel["target_areas"],
                shipped_at=rel["shipped_at"],
                release_date=rel["release_date"],
                impact_status=rel["impact_status"],
                sentiment_before=rel["sentiment_before"],
                sentiment_after=rel["sentiment_after"],
                issue_volume_before=rel["issue_volume_before"],
                issue_volume_after=rel["issue_volume_after"],
                key_insights=rel["key_insights"],
                verified=rel["verified"]
            )
            db.add(r)
    db.commit()

    # 4. Seed 50+ Realistic Fintech Feedback Records
    # Topics include: UPI payments, refunds, history latency, face verification,
    # instant notifications, 2FA SMS, dark mode, CSV exports, annual billing, card declines, etc.
    feedbacks_raw = [
        # UPI & Payment Failures (Key demonstration topic)
        ("fb-001", "Google Play", "Aarav Patel", "free", 1, "UPI payment failed twice while transferring ₹5,000. Money was debited from my bank but the app says transaction pending!", "Payments & Checkout", "critical", ["UPI", "Payment Gateway", "Double Debit"], ["UPI Payment Gateway Failure"]),
        ("fb-002", "App Store", "Rohan Mehta", "pro", 1, "UPI payment failed twice while transferring ₹5,000 for rent. It debited my account but never reached the landlord. Super stressful!", "Payments & Checkout", "critical", ["UPI", "Payment Gateway", "Transfer Failure"], ["UPI Payment Gateway Failure"]),
        ("fb-003", "Zendesk", "Kavita Reddy", "enterprise", 1, "Our accounts team tried executing 4 vendor UPI payouts and 3 failed with timeout error PG-504. Urgent fix needed!", "Payments & Checkout", "critical", ["UPI", "Vendor Payouts", "Gateway Timeout"], ["UPI Payment Gateway Failure"]),
        ("fb-004", "Intercom", "Vikram Singh", "pro", 2, "UPI payment failed again after entering PIN. It froze for 40 seconds then gave error 'gateway unresponsive'.", "Payments & Checkout", "high", ["UPI", "PIN Entry", "Timeout"], ["UPI Payment Gateway Failure"]),
        ("fb-005", "Twitter/X", "@Ananya_Fin", "free", 1, "@InsightFintech why did my UPI transfer fail twice today? ₹10,000 stuck in limbo. Customer support not replying!", "Payments & Checkout", "critical", ["UPI", "Transfer Failure", "Support"], ["UPI Payment Gateway Failure"]),
        ("fb-006", "Survey", "Rahul Joshi", "pro", 1, "Payment gateway timeouts are happening almost daily during evening peak hours (7 PM to 9 PM).", "Payments & Checkout", "critical", ["Payment Gateway", "Peak Hours", "UPI"], ["UPI Payment Gateway Failure"]),
        ("fb-007", "App Store", "Neha Sharma", "free", 1, "I tried scanning QR code for ₹5,000 and UPI payment failed twice. It showed server busy error.", "Payments & Checkout", "high", ["UPI", "QR Code", "Server Busy"], ["UPI Payment Gateway Failure"]),
        ("fb-008", "Google Play", "Siddharth Rao", "pro", 2, "Payment failed twice with error code 503. The app used to be reliable but recent checkout update made it brittle.", "Payments & Checkout", "high", ["Payment Gateway", "Error 503", "Regression"], ["UPI Payment Gateway Failure"]),
        
        # Refunds & Chargebacks
        ("fb-009", "Zendesk", "Amitabh Sen", "pro", 1, "My refund hasn't arrived after 5 days. Your app said 24-48 hours. Where is my ₹12,400?", "Payments & Checkout", "high", ["Refunds", "Delayed Processing", "Turnaround"], ["Delayed Refund Processing"]),
        ("fb-010", "App Store", "Pooja Hegde", "free", 1, "My refund hasn't arrived after 5 days. Support just sends generic automated bot messages saying wait another 48 hours.", "Payments & Checkout", "high", ["Refunds", "Customer Support", "Bot Reply"], ["Delayed Refund Processing"]),
        ("fb-011", "Intercom", "Deepak Chopra", "enterprise", 2, "We have 8 pending employee reimbursement refunds that haven't arrived after 5 days. CFO is demanding escalation.", "Payments & Checkout", "critical", ["Refunds", "Enterprise Reimbursment", "SLA Breach"], ["Delayed Refund Processing"]),
        ("fb-012", "Survey", "Sunita Nair", "free", 2, "Refund turnaround time is the worst part of this app. 5 days waiting and no notification of refund status.", "Payments & Checkout", "medium", ["Refunds", "Status Tracking", "Turnaround"], ["Delayed Refund Processing"]),
        ("fb-013", "Google Play", "Manish Tiwari", "pro", 1, "Cancelled my subscription 5 days ago and refund hasn't arrived. Very disappointed with customer service.", "Payments & Checkout", "high", ["Refunds", "Subscription Cancellation"], ["Delayed Refund Processing"]),

        # Transaction History Latency
        ("fb-014", "App Store", "Jason Wright", "enterprise", 2, "Transaction history takes too long to load. Every time I open the past 30 days statement it spins for 15 seconds.", "Performance & API", "high", ["History", "API Latency", "Statement"], ["Transaction History Timeout"]),
        ("fb-015", "Google Play", "Suresh Kumar", "pro", 2, "Transaction history takes too long to load on Android. Sometimes it simply times out with a blank screen.", "Performance & API", "medium", ["History", "Load Time", "Blank Screen"], ["Transaction History Timeout"]),
        ("fb-016", "Zendesk", "Clara Oswald", "enterprise", 2, "Exporting and viewing transaction history takes too long to load for our business account with 5,000 monthly txns.", "Performance & API", "high", ["History", "Enterprise Volume", "Load Time"], ["Transaction History Timeout"]),
        ("fb-017", "Twitter/X", "@FintechGeek", "free", 3, "Transaction history takes too long to load when filtering by month. Can you please add database indexing?", "Performance & API", "low", ["History", "Filtering", "Database Indexing"], ["Transaction History Timeout"]),
        ("fb-018", "Intercom", "Liam Baker", "pro", 2, "History page spinner just runs indefinitely on 4G connections. Requires killing the app.", "Performance & API", "high", ["History", "Indefinite Spinner", "Mobile Data"], ["Transaction History Timeout"]),

        # Biometric & Face Verification
        ("fb-019", "Google Play", "Aditi Verma", "free", 1, "Face verification keeps failing. The camera opens and immediately crashes on my Pixel 7 with Android 14.", "Authentication & Security", "critical", ["Face ID", "Android 14", "Biometrics"], ["Biometric Verification Failure"]),
        ("fb-020", "App Store", "Naveen Raj", "pro", 2, "Face verification keeps failing after the latest update. Face ID prompt doesn't register and forces manual password.", "Authentication & Security", "high", ["Face ID", "Authentication Bug", "iOS"], ["Biometric Verification Failure"]),
        ("fb-021", "Zendesk", "Rajesh Khanna", "enterprise", 1, "Face verification keeps failing during login for all team members using Android 14. Completely locked out of payroll!", "Authentication & Security", "critical", ["Biometrics", "Android 14", "Locked Out"], ["Biometric Verification Failure"]),
        ("fb-022", "Intercom", "Kiran Shah", "free", 2, "Face verification keeps failing in dim lighting. Can we please have fingerprint or PIN as automatic fallback?", "Authentication & Security", "medium", ["Biometrics", "Dim Lighting", "PIN Fallback"], ["Biometric Verification Failure"]),

        # Instant Notifications (Feature Requests)
        ("fb-023", "App Store", "Priya Nambiar", "pro", 5, "Please add instant payment notifications! When someone sends me money, I only see it 5 minutes later.", "UI & Experience", "medium", ["Notifications", "Push Alerts", "Instant Transfers"], ["Instant Notification Request"]),
        ("fb-024", "Google Play", "Karthik Raja", "free", 4, "Please add instant payment notifications via WhatsApp or SMS. It would give great peace of mind.", "UI & Experience", "low", ["Notifications", "WhatsApp", "SMS Alert"], ["Instant Notification Request"]),
        ("fb-025", "Twitter/X", "@StartupCFO", "enterprise", 4, "Please add instant payment notifications and webhooks for Slack. Our finance team needs real-time alerts.", "UI & Experience", "medium", ["Webhooks", "Slack", "Real-Time Alerts"], ["Instant Notification Request"]),
        ("fb-026", "Survey", "Anand Kulkarni", "pro", 4, "Great app, but please add instant payment notifications. Delay causes duplicate payment attempts.", "UI & Experience", "medium", ["Notifications", "Duplicate Prevention"], ["Instant Notification Request"]),

        # 2FA SMS & Delivery
        ("fb-027", "Zendesk", "David Chen", "enterprise", 1, "Since updating to v2.4, our European team members are not receiving the 2FA SMS code during checkout!", "Authentication & Security", "critical", ["2FA", "SMS Delivery", "International Carrier"], ["2FA SMS Delivery Timeout"]),
        ("fb-028", "Intercom", "Hans Zimmer", "enterprise", 1, "German office users blocked: 2FA SMS arrives 20 minutes late, long after the 3-minute expiry window!", "Authentication & Security", "critical", ["2FA", "SMS Expiry", "Germany Carriers"], ["2FA SMS Delivery Timeout"]),
        ("fb-029", "App Store", "Sophie Martin", "pro", 2, "SMS verification code never arrived for my French phone number (+33). Had to switch to another app.", "Authentication & Security", "high", ["SMS Delivery", "France", "Churn Risk"], ["2FA SMS Delivery Timeout"]),

        # Accidental Annual Billing & Subscription UX
        ("fb-030", "Zendesk", "Emily Watson", "pro", 1, "I was charged $240 for an annual plan when I only selected monthly! The toggle was pre-checked without clear warning.", "Checkout & Billing", "critical", ["Billing", "Annual Toggle", "Unexpected Charge"], ["Accidental Annual Billing"]),
        ("fb-031", "Intercom", "Marcus Bell", "free", 1, "Accidental yearly charge of $180 debited yesterday. Please reverse immediately or I will dispute with my bank.", "Checkout & Billing", "critical", ["Billing", "Chargeback Risk", "Dispute"], ["Accidental Annual Billing"]),
        ("fb-032", "Twitter/X", "@DevGuru_Sam", "pro", 2, "The v2.2 pricing modal is misleading. Default annual billing checkbox tricked me into yearly bill.", "Checkout & Billing", "high", ["Billing", "Dark Pattern", "Trust Erosion"], ["Accidental Annual Billing"]),

        # Dark Mode Praise & Accessibility
        ("fb-033", "App Store", "Carlos Santana", "free", 5, "OLED pure dark mode is gorgeous! Saves battery and looks sleek at night. Best update yet!", "UI & Experience", "low", ["Dark Mode", "OLED", "Aesthetics"], ["Dark Mode Praise"]),
        ("fb-034", "Google Play", "Maya Lin", "pro", 5, "The new dark mode colors and typography are so pleasant to read. High contrast mode is very accessible.", "UI & Experience", "low", ["Dark Mode", "Accessibility", "Typography"], ["Dark Mode Praise"]),
        ("fb-035", "Twitter/X", "@DesignLead_K", "pro", 5, "Shoutout to the InsightFintech design team for the v2.3 dark theme. Smooth gradients and no eye strain.", "UI & Experience", "low", ["Dark Theme", "Design Praise", "Eye Strain"], ["Dark Mode Praise"]),

        # CSV & Analytics Export
        ("fb-036", "Zendesk", "Robert Downey", "enterprise", 2, "Exporting 50,000 transaction rows crashes the browser tab. We cannot do our end-of-month reconciliations.", "Performance & API", "high", ["CSV Export", "Browser Crash", "Reconciliation"], ["CSV Export Browser Freeze"]),
        ("fb-037", "Intercom", "Fiona Gallagher", "pro", 2, "Export button freezes screen on Safari when exporting tax reports with more than 10k rows.", "Performance & API", "high", ["Export", "Safari", "Tax Report"], ["CSV Export Browser Freeze"]),

        # Credit & Debit Card Processing
        ("fb-038", "App Store", "Kenji Sato", "free", 2, "Credit card declined with cryptic code ERR_8812. No explanation of why or how to fix it.", "Payments & Checkout", "medium", ["Card Decline", "Error Codes", "UX Clarity"], ["Cryptic Card Decline Code"]),
        ("fb-039", "Google Play", "Ayesha Khan", "pro", 2, "International Visa card payments constantly get rejected without triggering 3D Secure OTP screen.", "Payments & Checkout", "high", ["Visa", "3D Secure", "International Card"], ["Cryptic Card Decline Code"]),

        # Multi-Currency & Foreign Exchange
        ("fb-040", "App Store", "Matteo Rossi", "pro", 4, "EUR to USD conversion rate is great, but rate lock timer should be 15 minutes instead of 3 minutes.", "Payments & Checkout", "low", ["FX", "Currency Exchange", "Rate Lock"], ["FX Rate Lock Expiry"]),
        ("fb-041", "Zendesk", "Lucas Silva", "enterprise", 3, "Cross-border payout to Brazilian Real took 4 days instead of same-day promised in v2.1 notes.", "Payments & Checkout", "medium", ["Cross-Border", "BRL", "Settlement SLA"], ["Cross-Border Settlement Delay"]),

        # Onboarding & Verification
        ("fb-042", "Survey", "Gaurav Sen", "free", 2, "KYC identity document upload keeps rejecting clear photos of government ID for 'blurriness'.", "Authentication & Security", "medium", ["KYC", "ID Upload", "OCR Rejection"], ["KYC Document Rejection"]),
        ("fb-043", "Intercom", "Zara Phillips", "free", 3, "12-step onboarding wizard is way too long. I just wanted to send money to a friend.", "UI & Experience", "low", ["Onboarding", "Tour Length", "Signup Dropoff"], ["Onboarding Tour Length"]),

        # App Performance & Crashes
        ("fb-044", "Google Play", "Tanya Gupta", "free", 1, "App crashes immediately on startup on Samsung Galaxy S23 after latest update!", "Performance & API", "critical", ["Crash", "Samsung", "Startup Crash"], ["App Startup Crash"]),
        ("fb-045", "App Store", "Oliver Queen", "pro", 1, "Cold boot launch takes over 7 seconds on iPhone 12. Much slower than competing fintech apps.", "Performance & API", "medium", ["Launch Time", "Cold Boot", "Optimization"], ["Slow Cold Boot"]),

        # Additional Fintech Real-World Feedback (reaches 55 items)
        ("fb-046", "App Store", "Harish Natarajan", "pro", 1, "UPI payment failed twice while transferring ₹5,000 for medical bill. Amount deducted, hospital didn't receive.", "Payments & Checkout", "critical", ["UPI", "Medical Payout", "Urgent"], ["UPI Payment Gateway Failure"]),
        ("fb-047", "Google Play", "Simran Kaur", "free", 2, "UPI transfer failed with bank timeout. Took 3 days to reverse back to my account.", "Payments & Checkout", "high", ["UPI", "Bank Timeout", "Auto Reversal"], ["UPI Payment Gateway Failure"]),
        ("fb-048", "Zendesk", "Michael Scott", "enterprise", 1, "Corporate card auto-reload failed silently. Staff cards getting declined during business trips.", "Checkout & Billing", "critical", ["Corporate Card", "Auto Reload", "Silent Failure"], ["Corporate Card Auto-Reload Failure"]),
        ("fb-049", "Intercom", "Pam Beesly", "pro", 4, "Love the invoice generator! Would be perfect if it had recurring monthly auto-invoicing.", "Checkout & Billing", "low", ["Invoices", "Recurring Billing", "Feature Request"], ["Recurring Invoicing Request"]),
        ("fb-050", "Twitter/X", "@FintechPulse", "free", 3, "Seeing reports of UPI failure spikes on @InsightFintech today. Is the ICICI/HDFC gateway experiencing downtime?", "Payments & Checkout", "critical", ["UPI Spike", "Gateway Downtime", "Public Sentiment"], ["UPI Payment Gateway Failure"]),
        ("fb-051", "Survey", "Dwight Schrute", "pro", 1, "Face verification keeps failing when I wear glasses. Very annoying to take them off every time.", "Authentication & Security", "medium", ["Face ID", "Eyewear", "Biometrics"], ["Biometric Verification Failure"]),
        ("fb-052", "Google Play", "Jim Halpert", "free", 5, "One-click pay in v2.4 is buttery smooth. Transferred money in 2 seconds flat.", "Payments & Checkout", "low", ["One-Click Pay", "Praise", "Speed"], ["One-Click Pay Praise"]),
        ("fb-053", "App Store", "Stanley Hudson", "pro", 1, "My refund hasn't arrived after 5 days. Every day I call support and get told 'it's in queue'. Unacceptable.", "Payments & Checkout", "high", ["Refunds", "Support Queue", "Delayed SLA"], ["Delayed Refund Processing"]),
        ("fb-054", "Zendesk", "Angela Martin", "enterprise", 1, "Audit logs do not show who approved the $15,000 international wire transfer. Compliance blocker.", "Authentication & Security", "critical", ["Audit Logs", "Compliance", "Security"], ["Audit Logging Deficit"]),
        ("fb-055", "Intercom", "Kevin Malone", "free", 3, "Transaction history takes too long to load on low battery mode. Phone gets warm.", "Performance & API", "low", ["History", "Battery Drain", "Optimization"], ["Transaction History Timeout"])
    ]

    for fb in feedbacks_raw:
        fid, source, cname, tier, rating, content, area, urg, tags, issues = fb
        existing_fb = db.query(FeedbackItem).filter(FeedbackItem.id == fid).first()
        if not existing_fb:
            score = 0.85 if rating >= 4 else (-0.85 if rating <= 2 else 0.0)
            sentiment = "positive" if rating >= 4 else ("negative" if rating <= 2 else "neutral")
            priority = "P0" if urg == "critical" else ("P1" if urg == "high" else ("P2" if urg == "medium" else "P3"))
            
            # Map release id
            rel_id = "rel-v2.4.1" if "v2.4.1" in content or "hotfix" in content.lower() else (
                "rel-v2.4.0" if "v2.4" in content or "checkout" in content.lower() else (
                    "rel-v2.3.0" if "dark mode" in content.lower() else "rel-v2.2.0"
                )
            )

            item = FeedbackItem(
                id=fid,
                workspace_id=workspace.id,
                source=source,
                customer_name=cname,
                customer_email=f"{cname.lower().replace(' ', '.')}@example.com",
                customer_tier=tier,
                rating=float(rating),
                content=content,
                sentiment=sentiment,
                sentiment_score=score,
                urgency=urg,
                priority=priority,
                summary=content[:100] + "...",
                product_area=area,
                category=area,
                tags=tags,
                themes=tags,
                issues=issues,
                feature_request="please add" in content.lower() or "would be perfect" in content.lower(),
                churn_signal="cancel" in content.lower() or "switch" in content.lower() or urg == "critical",
                ai_confidence=0.94,
                ai_analyzed=True,
                status="new" if urg == "critical" else "reviewed",
                release_id=rel_id,
                memory_retained=True,
                created_at=datetime.now(timezone.utc) - timedelta(days=min(30, int(fid.split("-")[1]) % 25 + 1))
            )
            db.add(item)
    db.commit()

    # 5. Seed 10+ Insights with supporting evidence
    insights_data = [
        {
            "id": "ins-1",
            "title": "Payment failures have become the dominant negative theme",
            "theme": "Payments & Checkout",
            "category": "Emerging Trends",
            "explanation": "Complaints regarding failed UPI payment gateway timeouts spiked +184% following the v2.4 checkout rollout. Customers report ₹5,000+ amounts debited but stuck in pending.",
            "evidence": "1,284 mentions across 4 sources (App Store, Google Play, Zendesk, Twitter)",
            "mentions": 1284,
            "change_pct": 184.0,
            "confidence": 0.94,
            "impact": "critical",
            "mrr_at_risk": 45000.0,
            "urgency": "critical",
            "suggested": ["Deploy gateway timeout retry hotfix v2.4.1", "Add instant transaction status webhook polling"]
        },
        {
            "id": "ins-2",
            "title": "Refund complaints have remained unresolved across multiple releases",
            "theme": "Payments & Checkout",
            "category": "Recurring Problems",
            "explanation": "Customers waiting over 5 days for automated refund reversals. Cross-referenced Hindsight memory indicates bank gateway settlement queue delays persist since v2.2.",
            "evidence": "640 mentions · 142 enterprise accounts",
            "mentions": 640,
            "change_pct": 45.0,
            "confidence": 0.89,
            "impact": "high",
            "mrr_at_risk": 18000.0,
            "urgency": "high",
            "suggested": ["Implement automated instant refund rails via IMPS/NEFT", "Provide live refund tracker timeline in UI"]
        },
        {
            "id": "ins-3",
            "title": "Customers repeatedly request instant transaction notifications",
            "theme": "UI & Experience",
            "category": "Feature Requests",
            "explanation": "High demand for instant Push/SMS/WhatsApp transaction confirmations. Users cite anxiety and duplicate transfer attempts when alerts lag by more than 30 seconds.",
            "evidence": "520 requests across support and App Store reviews",
            "mentions": 520,
            "change_pct": 22.0,
            "confidence": 0.88,
            "impact": "high",
            "mrr_at_risk": 12000.0,
            "urgency": "medium",
            "suggested": ["Prioritize real-time WebSocket push notifications", "Add WhatsApp business confirmation integration"]
        },
        {
            "id": "ins-4",
            "title": "Biometric face verification failures spikes churn signal on Android 14",
            "theme": "Authentication & Security",
            "category": "Churn Signals",
            "explanation": "Android 14 biometric credential handler exceptions cause immediate camera crashes on Pixel and Galaxy devices during first login.",
            "evidence": "350 crash reports · 28 critical Zendesk tickets",
            "mentions": 350,
            "change_pct": 28.0,
            "confidence": 0.86,
            "impact": "critical",
            "mrr_at_risk": 9500.0,
            "urgency": "critical",
            "suggested": ["Upgrade Android BiometricPrompt library", "Provide instant device PIN fallback"]
        },
        {
            "id": "ins-5",
            "title": "Transaction history API latency unresolved during peak evening hours",
            "theme": "Performance & API",
            "category": "Recurring Problems",
            "explanation": "Database read queries on transaction history exceed 4 seconds during 7-9 PM peak load. Redis caching in v2.3.2 helped small accounts but large accounts still lag.",
            "evidence": "920 mentions · p95 latency 3.8s",
            "mentions": 920,
            "change_pct": 12.0,
            "confidence": 0.91,
            "impact": "medium",
            "mrr_at_risk": 12000.0,
            "urgency": "medium",
            "suggested": ["Implement cursor pagination on history endpoint", "Partition transaction table by statement month"]
        },
        {
            "id": "ins-6",
            "title": "OLED dark mode drove highest customer satisfaction spike this year",
            "theme": "UI & Experience",
            "category": "Opportunities",
            "explanation": "v2.3 dark mode received 94% positive sentiment across App Store and Play Store reviews. Customers praise eye comfort and battery savings.",
            "evidence": "894 mentions · 4.8 average rating score",
            "mentions": 894,
            "change_pct": 94.0,
            "confidence": 0.97,
            "impact": "medium",
            "mrr_at_risk": 0.0,
            "urgency": "low",
            "suggested": ["Add automatic sunset/sunrise theme scheduling", "Extend OLED dark theme to export PDF reports"]
        },
        {
            "id": "ins-7",
            "title": "2FA SMS delivery timeouts blocking international Enterprise accounts",
            "theme": "Authentication & Security",
            "category": "Emerging Trends",
            "explanation": "International SMS carrier routing delays prevent European enterprise users from completing checkout verification.",
            "evidence": "284 mentions · 142 enterprise accounts",
            "mentions": 284,
            "change_pct": 67.0,
            "confidence": 0.91,
            "impact": "critical",
            "mrr_at_risk": 32000.0,
            "urgency": "critical",
            "suggested": ["Add secondary carrier fallback (Twilio/Infobip)", "Enable TOTP authenticator app support"]
        },
        {
            "id": "ins-8",
            "title": "Accidental annual billing toggle generated customer trust erosion",
            "theme": "Checkout & Billing",
            "category": "Customer Pain Points",
            "explanation": "The v2.2 default annual billing selection caused unexpected yearly deductions. Even after the v2.2.1 toggle fix, residual trust erosion visible in renewals.",
            "evidence": "310 affected users · 42 refund requests",
            "mentions": 310,
            "change_pct": -18.0,
            "confidence": 0.82,
            "impact": "high",
            "mrr_at_risk": 14000.0,
            "urgency": "high",
            "suggested": ["Ensure billing frequency toggle requires explicit active user selection"]
        },
        {
            "id": "ins-9",
            "title": "Large CSV dataset export causes client browser tab crash",
            "theme": "Performance & API",
            "category": "Customer Pain Points",
            "explanation": "Client-side memory exhaustion when rendering >50k rows. Addressed in v2.3.1 with S3 chunked streaming.",
            "evidence": "180 mentions · 15 enterprise churn risks",
            "mentions": 180,
            "change_pct": -87.0,
            "confidence": 0.93,
            "impact": "medium",
            "mrr_at_risk": 8000.0,
            "urgency": "medium",
            "suggested": ["Monitor background worker queue depth", "Provide asynchronous email delivery for heavy exports"]
        },
        {
            "id": "ins-10",
            "title": "Multi-currency rate lock duration too short for international wires",
            "theme": "Payments & Checkout",
            "category": "Feature Requests",
            "explanation": "3-minute rate lock expires before enterprise compliance officers can co-sign international wire approvals.",
            "evidence": "95 enterprise support tickets",
            "mentions": 95,
            "change_pct": 14.0,
            "confidence": 0.85,
            "impact": "medium",
            "mrr_at_risk": 6500.0,
            "urgency": "medium",
            "suggested": ["Extend rate lock window to 15 minutes for verified corporate tiers"]
        }
    ]

    for ins in insights_data:
        existing_ins = db.query(InsightCluster).filter(InsightCluster.id == ins["id"]).first()
        if not existing_ins:
            c = InsightCluster(
                id=ins["id"],
                workspace_id=workspace.id,
                title=ins["title"],
                theme=ins["theme"],
                category=ins["category"],
                description=ins["explanation"],
                explanation=ins["explanation"],
                evidence=ins["evidence"],
                mentions=ins["mentions"],
                change_pct=ins["change_pct"],
                confidence=ins["confidence"],
                impact=ins["impact"],
                mrr_at_risk=ins["mrr_at_risk"],
                urgency=ins["urgency"],
                impact_score=min(10.0, round(ins["mrr_at_risk"] / 4500.0 + 3.0, 1)),
                sample_quotes=[
                    "UPI payment failed twice while transferring ₹5,000.",
                    "My refund hasn't arrived after 5 days.",
                    "Transaction history takes too long to load."
                ],
                suggested_actions=ins["suggested"],
                status="active"
            )
            db.add(c)
    db.commit()

    # 6. Seed 10+ Product Actions (Action Hub)
    actions_data = [
        {"id": "act-1", "title": "Investigate payment gateway timeout and retry handling", "priority": "P0", "status": "In Progress", "owner": "Sarah Chen", "area": "Payments & Checkout", "insight_id": "ins-1"},
        {"id": "act-2", "title": "Configure SMS carrier fallback gateway with Twilio", "priority": "P0", "status": "Completed", "owner": "Alex Mercer", "area": "Authentication & Security", "insight_id": "ins-7"},
        {"id": "act-3", "title": "Patch Android 14 biometric verification handler exception", "priority": "P0", "status": "Completed", "owner": "Priya Sharma", "area": "Authentication & Security", "insight_id": "ins-4"},
        {"id": "act-4", "title": "Automate instant refund processing webhook rail", "priority": "P1", "status": "Investigating", "owner": "Marcus Vance", "area": "Payments & Checkout", "insight_id": "ins-2"},
        {"id": "act-5", "title": "Add Redis caching for transaction history endpoints", "priority": "P1", "status": "Completed", "owner": "Sarah Chen", "area": "Performance & API", "insight_id": "ins-5"},
        {"id": "act-6", "title": "Deploy WebSocket architecture for instant transaction notifications", "priority": "P1", "status": "In Progress", "owner": "Alex Mercer", "area": "UI & Experience", "insight_id": "ins-3"},
        {"id": "act-7", "title": "Implement S3 streaming for large CSV dataset exports", "priority": "P2", "status": "Verified", "owner": "Priya Sharma", "area": "Performance & API", "insight_id": "ins-9"},
        {"id": "act-8", "title": "Redesign subscription pricing modal with explicit radio toggles", "priority": "P1", "status": "Verified", "owner": "Sarah Chen", "area": "Checkout & Billing", "insight_id": "ins-8"},
        {"id": "act-9", "title": "Extend multi-currency FX rate lock to 15 minutes for Enterprise", "priority": "P2", "status": "Open", "owner": "Marcus Vance", "area": "Payments & Checkout", "insight_id": "ins-10"},
        {"id": "act-10", "title": "Add sunset auto-scheduling to OLED dark mode toggle", "priority": "P3", "status": "Open", "owner": "Priya Sharma", "area": "UI & Experience", "insight_id": "ins-6"}
    ]

    for act in actions_data:
        existing_act = db.query(ActionItem).filter(ActionItem.id == act["id"]).first()
        if not existing_act:
            a = ActionItem(
                id=act["id"],
                workspace_id=workspace.id,
                title=act["title"],
                priority=act["priority"],
                status=act["status"],
                owner=act["owner"],
                product_area=act["area"],
                insight_id=act["insight_id"],
                target_system="Linear",
                action_type="linear_issue",
                payload={"priority": act["priority"], "team": act["area"]},
                execution_result={"external_id": f"LIN-{act['id'].upper()}", "url": f"https://linear.app/insightloop/{act['id']}"}
            )
            db.add(a)
    db.commit()

    # 7. Seed Hindsight Persistent Memories (The core differentiator!)
    # Populate rich, structured memories so the agent immediately knows the history
    hindsight_memories_data = [
        {
            "content": "[PAYMENTS & CHECKOUT] UPI payment failed twice while transferring ₹5,000. Recurring pattern of gateway timeouts PG-504 reported across App Store and Zendesk during evening peak volume.",
            "type": "observation",
            "metadata": {"theme": "Payments", "issue": "UPI Payment Gateway Failure", "urgency": "critical", "source": "App Store"},
            "score": 0.95
        },
        {
            "content": "[REFUNDS & CHARGEBACKS] Customer complaints regarding delayed refund processing: turnaround times currently averaging 5 days instead of promised 24-48 hours.",
            "type": "observation",
            "metadata": {"theme": "Payments", "issue": "Delayed Refund Processing", "urgency": "high", "source": "Zendesk"},
            "score": 0.90
        },
        {
            "content": "[AUTHENTICATION] Android 14 update causes biometric face verification crashes on Google Pixel 7 and Samsung S23 devices during first login.",
            "type": "observation",
            "metadata": {"theme": "Authentication", "issue": "Biometric Verification Failure", "urgency": "critical", "source": "Google Play"},
            "score": 0.92
        },
        {
            "content": "[PERFORMANCE] Transaction history query latency exceeds 3.8s during peak hours for accounts with high transaction volume.",
            "type": "observation",
            "metadata": {"theme": "Performance", "issue": "Transaction History Timeout", "urgency": "medium", "source": "App Store"},
            "score": 0.85
        },
        {
            "content": "[FEATURE REQUEST] Customers repeatedly request instant transaction notifications via push alerts or WhatsApp to prevent duplicate transfers.",
            "type": "observation",
            "metadata": {"theme": "UI & Experience", "issue": "Instant Notification Request", "urgency": "medium", "source": "Survey"},
            "score": 0.88
        },
        {
            "content": "[DECISION] Product decision: Assigned Action 'Investigate payment gateway timeout and retry handling' to Linear (LIN-ACT-1). Target resolution for v2.4.1 hotfix.",
            "type": "decision",
            "metadata": {"action_id": "act-1", "priority": "P0", "system": "Linear"},
            "score": 0.90
        },
        {
            "content": "[RELEASE OUTCOME] Software release v2.4.0 shipped: One-click pay increased completion rate by +34%, but introduced regression with unhandled UPI gateway timeouts.",
            "type": "release_outcome",
            "metadata": {"version": "v2.4.0", "sentiment_delta": 0.70, "volume_before": 840, "volume_after": 1240},
            "score": 0.95
        },
        {
            "content": "Impact Verification for Release v2.4.1: Issue 'Payment Failures' BEFORE=1,240 mentions, AFTER=482 mentions (-61% drop). Result: Improved. Post-release sentiment shift: +1.44.",
            "type": "impact_verification",
            "metadata": {"version": "v2.4.1", "outcome": "Improved", "volume_before": 1240, "volume_after": 482},
            "score": 0.98
        }
    ]

    for mem in hindsight_memories_data:
        existing_mem = db.query(MemoryItem).filter(MemoryItem.content == mem["content"]).first()
        if not existing_mem:
            hindsight_service.retain(
                db=db,
                content=mem["content"],
                bank_id="default",
                memory_type=mem["type"],
                metadata=mem["metadata"],
                importance_score=mem["score"]
            )

    logger.info("Successfully seeded 55 feedback items, 8 releases, 10 insights, 10 actions, and persistent Hindsight memories!")
