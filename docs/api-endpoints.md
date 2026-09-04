# API Endpoints

Detailed reference for every route. For the frozen contract summary and the
frozen incident structure, see `shared/api-contract.md` — this file expands
on it with status codes, error shapes, and examples.

Base URL (local): `http://localhost:8000`
Auth: `Authorization: Bearer <token>` header, unless noted otherwise.

Every error response follows FastAPI's default shape:
```json
{ "detail": "human readable message" }
```
or, for validation errors (`422`):
```json
{ "detail": [ { "loc": [...], "msg": "...", "type": "..." } ] }
```

---

## Auth

### `POST /api/auth/register`
| | |
|---|---|
| Auth required | No |
| Success | `201 Created` |
| Errors | `400` username already taken, `422` invalid body |

Request:
```json
{ "username": "meena_demo", "password": "password123", "unlock_pin": "1234" }
```
`unlock_pin` is optional (4–8 chars) and is used to unlock the disguised UI.

Response:
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": { "id": "USR604CE0DCC7", "username": "meena_demo", "created_at": "2026-09-03T06:15:01Z" }
}
```
A `CaseRecord` is created automatically for the new user in the same transaction.

### `POST /api/auth/login`
| | |
|---|---|
| Auth required | No |
| Success | `200 OK` |
| Errors | `401` incorrect username or password |

Request: `{ "username": "...", "password": "..." }`
Response: same shape as register.

### `GET /api/auth/me`
| | |
|---|---|
| Auth required | Yes |
| Success | `200 OK` |
| Errors | `401` invalid/missing token |

Response: `{ "id", "username", "created_at" }`

---

## Incidents

### `POST /api/incidents`
| | |
|---|---|
| Auth required | Yes |
| Success | `201 Created` |
| Errors | `401`, `422` bad date/time format |

`user_id` is never read from the body — it comes from the token, so one
survivor can never create incidents under another's account.

Request: see the frozen incident structure in `shared/api-contract.md`
(everything except `incident_id`, `user_id`, `evidence`, `ai_classification`,
`created_at`, which the server fills in).

Response `201`: the full incident object, `evidence: []`, `ai_classification: null`
until `/api/case/structure` is called.

### `GET /api/incidents`
| | |
|---|---|
| Auth required | Yes |
| Success | `200 OK` — array, newest first |

### `GET /api/incidents/{incident_id}`
| | |
|---|---|
| Auth required | Yes |
| Success | `200 OK` |
| Errors | `404` not found or not owned by caller |

---

## Evidence

### `POST /api/evidence`
`multipart/form-data`, not JSON.

| Field | Type | Notes |
|---|---|---|
| `incident_id` | string | must belong to the caller |
| `type` | string | `image`\|`bank_sms`\|`chat_screenshot`\|`audio`\|`document`\|`video`\|`other` |
| `notes` | string | optional |
| `file` | binary | required, non-empty |

| | |
|---|---|
| Auth required | Yes |
| Success | `201 Created` |
| Errors | `404` incident not found, `422` bad type or empty file |

Response:
```json
{
  "evidence_id": "EVDC87D035553",
  "incident_id": "INC4B14D61763",
  "type": "bank_sms",
  "original_filename": "screenshot.png",
  "sha256_hash": "da22118e...",
  "notes": "card withdrawal alert",
  "created_at": "2026-09-03T06:15:21Z"
}
```
The `sha256_hash` is computed server-side over the raw bytes for chain-of-custody.

### `GET /api/evidence/{incident_id}`
| | |
|---|---|
| Auth required | Yes |
| Success | `200 OK` — array of evidence for that incident |
| Errors | `404` incident not found |

---

## Case

### `GET /api/case/{user_id}`
| | |
|---|---|
| Auth required | Yes, and `user_id` must equal the caller |
| Success | `200 OK` |
| Errors | `403` viewing another user's case, `404` no case record yet |

### `POST /api/case/structure`
| | |
|---|---|
| Auth required | Yes |
| Success | `200 OK` |
| Errors | `404` incident not found |

Request: `{ "incident_id": "INC4B14D61763" }`

This is where Person 2's classifier runs. Response is the incident object
with `ai_classification` populated, e.g.:
```json
{ "tags": ["physical", "economic", "digital"], "confidence": 0.6, "method": "rule_based_fallback" }
```
Calling this also recomputes and persists the caller's `readiness_score`.

---

## Packs

### `POST /api/packs/generate`
| | |
|---|---|
| Auth required | Yes |
| Success | `200 OK` |
| Errors | `422` invalid `pack_type` |

Request: `{ "pack_type": "dv_pack" }` (or `economic_pack`, `cyber_pack`)

Response includes every incident matching that pack's category, plus
pack-specific extras (`totals` for economic, `platforms_involved` for cyber).
Generation is recorded on the `CaseRecord.generated_packs` history.

---

## Support Navigator

### `GET /api/support/recommendations?city=Delhi`
| | |
|---|---|
| Auth required | Yes |
| Success | `200 OK` — array, possibly empty |

`city` is optional. Categories are inferred from which of
physical/economic/digital appear across the caller's incidents; with no
incidents yet, a safe default set (police, counseling, legal) is returned.

---

## Guardian Vault

### `POST /api/guardian/backup`
| | |
|---|---|
| Auth required | Yes |
| Success | `200 OK` |

Request: `{ "guardian_name": "Sister Priya", "guardian_contact": "priya@example.com" }`
Response includes a `recovery_code` — **shown exactly once, never retrievable again.**

### `POST /api/guardian/recover`
| | |
|---|---|
| Auth required | **No** — this is the lost-device recovery path |
| Success | `200 OK` |
| Errors | `400` invalid guardian_id/recovery_code |

Request: `{ "guardian_id": "GRD...", "recovery_code": "X7K2-9PLQ" }`
Response: the decrypted backup snapshot, `{ "user_id", "backed_up_at", "incidents": [...] }`.

---

## Handoff

### `POST /api/handoff/generate`
| | |
|---|---|
| Auth required | Yes |
| Success | `200 OK` |

Request:
```json
{ "consented_categories": ["physical", "economic"], "include_evidence": false, "recipient_note": "For counselor review" }
```
Only incidents matching at least one consented category are included. If
`include_evidence` is `false`, each incident's `evidence` array is emptied
even if evidence exists — nothing beyond what was explicitly consented to
ever leaves this endpoint.

---

## Status code summary

| Code | Meaning |
|---|---|
| 200 | Success (read or non-creating write) |
| 201 | Resource created |
| 400 | Bad request (e.g. wrong recovery code, duplicate username) |
| 401 | Missing/invalid/expired token |
| 403 | Authenticated, but not allowed to access this resource |
| 404 | Resource not found or not owned by caller |
| 422 | Validation error (bad field format/value) |
| 500 | Unhandled server error — should never happen; report it |
