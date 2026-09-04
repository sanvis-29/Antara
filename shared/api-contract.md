# ANTARA API Contract — FROZEN

This file is frozen. Nobody changes a route, field name, or response shape
here without telling Person 1, Person 2, and Person 3 first. All three
codebases are built against this document.

Base URL (local dev): `http://localhost:8000`
All routes are prefixed with `/api` except `/`, `/health`, and `/docs`.

Auth: Bearer JWT in the `Authorization` header, obtained from
`/api/auth/login` or `/api/auth/register`. Every route below except
`auth/register`, `auth/login`, and `guardian/recover` requires it.

---

## Auth

### `POST /api/auth/register`
Body:
```json
{ "username": "string", "password": "string", "unlock_pin": "string (optional)" }
```
Response `201`: `{ "access_token": "...", "token_type": "bearer", "user": { "id", "username", "created_at" } }`

### `POST /api/auth/login`
Body: `{ "username": "string", "password": "string" }`
Response `200`: same shape as register.

### `GET /api/auth/me`
Response `200`: `{ "id", "username", "created_at" }`

---

## Incidents

### `POST /api/incidents`
Person 1 sends this. Person 3 stores it. `user_id` is taken from the JWT,
never from the body.

Body (matches the frozen incident structure below, minus `incident_id`,
`user_id`, and `evidence`):
```json
{
  "description": "Husband hit me, took my debit card and threatened me.",
  "date": "2026-08-18",
  "time": "21:30",
  "location": "home",
  "people_involved": [{ "role": "husband", "name": "optional" }],
  "categories": { "physical": true, "economic": true, "digital": true },
  "economic_details": { "money_controlled": true, "card_withheld":