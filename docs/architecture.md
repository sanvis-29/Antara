# Architecture

## One-paragraph summary

ANTARA is a disguised-entry safety app. A survivor unlocks a hidden dashboard
from what looks like an ordinary game. From there they log incidents, attach
evidence, get AI-assisted categorization (physical/economic/digital) and a
case-readiness score, find verified support services, back up their case to
a trusted Guardian, and hand off a consent-scoped bundle to a counselor or
legal aid worker. Every subsystem reads and writes one shared object: the
**CaseRecord**.

## System diagram (textual)

```
                     ┌─────────────────────────┐
                     │   Frontend (Person 1)    │
                     │  Next.js / disguised UI  │
                     └────────────┬─────────────┘
                                  │ HTTPS (JWT bearer)
                                  ▼
                     ┌─────────────────────────┐
                     │   Backend API (Person 3) │
                     │        FastAPI            │
                     │                            │
                     │  auth · incidents · evidence
                     │  case · guardian · packs   │
                     │  support                   │
                     └──┬──────────────┬─────────┘
                        │              │
             calls into │              │ persists to
                        ▼              ▼
          ┌───────────────────┐   ┌──────────────┐
          │ Intelligence layer │   │   Database    │
          │    (Person 2)      │   │ (SQLite/PG)   │
          │                    │   │               │
          │ case_engine/       │   │ users         │
          │  classifier.py     │   │ incidents     │
          │  extractor.py      │   │ evidence      │
          │  linker.py         │   │ guardians     │
          │  readiness.py      │   │ case_records  │
          │ navigator/         │   │ support_providers
          │ pack_generation/   │   └──────────────┘
          └───────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  Local file storage /   │
            │  object storage         │
            │  (encrypted evidence)   │
            └───────────────────────┘
```

## The backbone object: CaseRecord

Every subsystem meets here:

- **Person 1** renders `CaseRecord.readiness_score`, `tags`, and
  `generated_packs` on the Case Record screen and dashboard.
- **Person 2** writes to it: `POST /api/case/structure` triggers
  classification, which the backend uses to recompute `readiness_score`
  and `tags`.
- **Person 3** owns its storage, encryption of anything sensitive it
  references (incident descriptions), and access control (`user_id` must
  match the authenticated caller).

One `CaseRecord` per user, created automatically at registration.

## Data flow: the core milestone

1. Person 1's incident form `POST /api/incidents` with description + categories.
2. Person 3 encrypts the description (Fernet) and stores the row.
3. Person 1 (or an automatic trigger) calls `POST /api/case/structure`.
4. Person 2's classifier (`intelligence/case_engine/classifier.py`) — or the
   backend's rule-based fallback — returns `{tags, confidence, method}`.
5. Person 3 persists `ai_classification` on the incident and recomputes
   `CaseRecord.readiness_score` via `readiness.py`'s scoring logic.
6. Person 1 renders `Physical ✓ / Economic ✓ / Digital ✓` on the incident card.

## Trust boundaries

- **Survivor device ↔ Backend**: JWT bearer auth over HTTPS. Every write is
  scoped to the token's `user_id` server-side — never trusted from the client.
- **Backend ↔ Database**: incident descriptions and Guardian backup blobs are
  encrypted at rest (Fernet/AES). Evidence files are hashed (SHA-256) for
  integrity, not encrypted-in-place in the current version (see
  `security-model.md` for the production hardening path).
- **Backend ↔ Guardian**: a Guardian never receives plaintext. The backup
  blob is opaque; only a recovery code (bcrypt-hashed, shown once) unlocks it.
- **Survivor ↔ Third party (counselor/legal aid)**: only the categories the
  survivor explicitly consents to on the Handoff screen are ever included —
  enforced server-side in `POST /api/handoff/generate`, not just hidden in the UI.

## Why intelligence is a separate module, not baked into the backend

`intelligence/case_engine/` and `intelligence/navigator/` are designed to be
callable as a library from the backend (see `routes/case.py`'s
`_fallback_classify` docstring) or run standalone for testing/iteration by
Person 2 without needing the full API server up. This keeps Person 2
unblocked during the hackathon and makes the classifier swappable later
(rule-based → ML model → LLM-based) without touching route code.

## Deployment shape (hackathon demo)

- Backend: single FastAPI process + SQLite file, or Docker via
  `docker-compose.yml`.
- Frontend: Next.js dev server or static export, pointed at the backend's URL.
- No external services required for the demo — verified services dataset and
  demo fixtures are seeded from local JSON files.
