# InsightLoop: AI-Powered Customer Feedback Intelligence

> Turning scattered customer feedback into persistent product intelligence and closed-loop release impact verification with **Hindsight Persistent Agent Memory**.

---

## 🚀 Overview

Product teams receive continuous feedback from dozens of channels—App Store reviews, Zendesk tickets, user surveys, social channels, and in-app logs. Standard LLMs and isolated RAG systems treat each complaint in a vacuum: they answer the immediate question, but fail to remember recurring failure patterns across releases or track whether a fix actually solved the problem.

**InsightLoop** integrates **Hindsight Persistent Agent Memory** into a closed feedback-to-release loop:

```
CUSTOMER FEEDBACK  ──>  AI ANALYSIS  ──>  HINDSIGHT PERSISTENT MEMORY
                                                    │
RELEASE IMPACT VERIFIED  <──  ACTION HUB  <─────────┘
```

---

## 🧠 The Hindsight Persistent Memory Advantage

### Without Memory vs With Hindsight

| Dimension | Without Memory (Standard RAG / Isolated LLM) | With Hindsight (Persistent Agent Memory) |
|---|---|---|
| **Incident Context** | Sees each complaint as a one-off event. | Recalls 18+ historical complaints across past versions (e.g. v2.3, v2.4). |
| **Urgency Classification** | Low / Medium (P2/P3 standard triage). | **Critical (P0 / Escalated)** due to cumulative pattern. |
| **Recurring Detection** | Blind to cross-release trends. | Detects **+184% volume spike** and links to gateway timeouts. |
| **Business Impact** | Unquantified churn risk. | Calculates **$45,000 MRR at risk** across Enterprise & Pro tiers. |
| **Release Verification** | Requires manual spreadsheet analysis. | Automatically measures **-61% drop in post-release complaints** and logs resolution back into memory. |

---

## 🔄 Core Intelligence Loop: RETAIN → RECALL → REASON → ACT → VERIFY

1. **RETAIN (`POST /api/v1/memory/retain`)**:
   Incoming feedback is analyzed for sentiment, product area, issues, and customer tier, then explicitly retained in Hindsight memory banks.
2. **RECALL (`POST /api/v1/memory/recall`)**:
   When new feedback arrives, Hindsight recalls semantically and chronologically relevant historical complaints, past releases, and existing tickets.
3. **REASON (`POST /api/v1/memory/chat` & `/api/v1/memory/compare`)**:
   The AI reasons over recalled memories, determining whether the issue is recurring or escalating.
4. **ACT (`POST /api/v1/actions`)**:
   Synthesized insights are converted directly into prioritized Jira/Linear-style action items in the Action Hub.
5. **VERIFY (`POST /api/v1/releases/{id}/verify`)**:
   After shipping a fix (e.g. `v2.4.1`), InsightLoop tracks post-release feedback and verifies impact against pre-release benchmarks, permanently retaining the verification outcome in Hindsight.

---

## 🛠️ System Architecture

### Monolithic Modular Backend (FastAPI + SQLAlchemy + Hindsight SDK)
```
backend/
├── alembic/                # Database migrations
├── app/
│   ├── api/                # REST endpoints
│   │   ├── actions.py      # Action Hub CRUD and status transitions
│   │   ├── auth.py         # Multi-tenant auth & JWT tokens
│   │   ├── dashboard.py    # Metrics, search, data sources
│   │   ├── feedback.py     # Ingestion & AI enrichment
│   │   ├── insights.py     # Theme discovery & clustering
│   │   ├── memory.py       # Hindsight RETAIN / RECALL / CHAT / COMPARE / RECURRING
│   │   └── releases.py     # Release tracking & Impact Verification
│   ├── ai/
│   │   └── provider.py     # LLM inference & deterministic fallback engine
│   ├── core/
│   │   ├── config.py       # Pydantic v2 settings
│   │   ├── database.py     # SQLAlchemy engine & session factory
│   │   └── security.py     # Bcrypt password hashing & JWT
│   ├── memory/
│   │   └── hindsight.py    # Hindsight SDK client wrapper with fast-failover probe
│   ├── models/             # SQLAlchemy ORM models
│   ├── schemas/            # Pydantic v2 validation models
│   ├── services/           # Business domain services
│   ├── main.py             # FastAPI application root & CORS
│   └── seed.py             # Demo dataset initialization
└── tests/                  # 28 passing pytest unit & e2e tests
```

### Modern React Frontend (Vite + Tailwind CSS + Lucide)
```
src/
├── components/
│   ├── ActionHub/          # Prioritized ticket management (P0-P3, kanban)
│   ├── AIQueryAssistant/   # Live Chat, Memory Contrast, and Recurring Issues
│   ├── Dashboard/          # High-level metrics, volume trends, sentiment
│   ├── DataSources/        # Source management & feedback ingestion
│   ├── FeedbackExplorer/   # Multi-facet filtering (source, urgency, sentiment)
│   ├── Insights/           # AI Theme discovery & automatic synthesis
│   └── ReleaseTracker/     # Before/After release metrics & Hindsight Verification
├── services/
│   ├── apiService.ts       # Typed client for backend REST API
│   └── storageService.ts   # Client-side cache & persistence fallback
├── types.ts                # TypeScript domain models
└── App.tsx                 # Root layout & real-time API hydration
```

---

## 🧪 Automated Test Suite (28 Tests)

All backend endpoints and the end-to-end memory loop are verified with a 100% passing test suite:

```bash
cd backend
python -m pytest tests/ -v
```

### Test Coverage
- `tests/test_actions.py`: Action Hub item creation, listing, status transitions.
- `tests/test_auth.py`: JWT login, registration, workspace multi-tenancy.
- `tests/test_dashboard.py`: KPI summaries, search, data source metrics.
- `tests/test_e2e_memory_loop.py`: Full end-to-end loop: `Feedback → Retain → Recall → Reason → Act → Verify`.
- `tests/test_feedback.py`: Filtering, ingestion, AI categorization, memory retention.
- `tests/test_insights.py`: Dynamic theme clustering and synthesis.
- `tests/test_memory.py`: RETAIN, RECALL, Chat reasoning, recurring issues, compare mode.
- `tests/test_releases.py`: Release logging, before/after metrics, impact verification pipeline.

---

## 🏃 Quickstart: Running InsightLoop Locally

### 1. Prerequisites
- Python 3.12+
- Node.js 20+

### 2. Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Database initialization and automatic seed
python -m app.seed

# Run FastAPI backend server (port 8000)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Docs will be available at: `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
# In the project root (where package.json is located)
npm install

# Start Vite dev server (port 5173 with proxy to 8000)
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 💡 Key Demonstration Scenarios

1. **Interactive Hindsight Memory Chat**:
   - Navigate to **AI Memory**.
   - Ask: *"Why are customers unhappy with payments?"*
   - Observe cited evidence from past reviews, historical incident recurrence, and suggested action items.
2. **Without Memory vs With Hindsight Contrast**:
   - In **AI Memory**, click the **Memory Contrast** tab.
   - Select the preset *"UPI payment failed twice while transferring ₹5,000"*.
   - View the side-by-side comparison: standard LLM treats it as an isolated incident, whereas Hindsight recalls 18+ historical incidents and escalates to Critical P0.
3. **Release Impact Verification**:
   - Navigate to **Release Impact**.
   - Select release `v2.4.1` (*Payment Gateway Hotfix*).
   - Click **Verify Impact in Hindsight**.
   - Watch the backend compute the before/after drop (-61% complaint reduction, +1.30 sentiment shift) and retain the verification outcome into persistent memory.
