# Security Model

This describes what ANTARA actually protects against today, and is explicit
about what it does not yet protect against — better to be honest here than
to oversell safety properties to survivors.

## Threat model

The primary adversary is **someone with physical access to the survivor's
device** (the abuser), not a remote attacker. Secondary concerns: a breach
of the backend database, and a compromised or coerced Guardian.

## What's protected today

### 1. Disguised entry
The app presents as an innocuous game until a secret unlock sequence/PIN is
entered. This is a UI-layer mitigation against casual phone checks — it does
not protect against forensic device analysis.

### 2. Encryption at rest for sensitive fields
- Incident `description` fields are encrypted with Fernet (AES-128-CBC + HMAC)
  before being written to the database (`services/encryption_service.py`).
- Guardian Vault backup blobs are encrypted the same way.
- The encryption key (`ENCRYPTION_KEY`) is a server-side secret, separate
  from user passwords — a DB leak alone does not expose incident text.

**Caveat:** other incident fields (date, time, location, category booleans,
economic/digital detail flags) are currently stored in plaintext columns for
queryability (filtering, readiness scoring). Treat the database file itself
as sensitive regardless.

### 3. Password & token security
- Passwords are hashed with bcrypt (`passlib`), never stored in plaintext.
- Sessions use short-lived JWTs (`ACCESS_TOKEN_EXPIRE_MINUTES`, default 60min)
  signed with `SECRET_KEY`.
- `SECRET_KEY` and `ENCRYPTION_KEY` must be set via environment variables in
  any real deployment — the code falls back to an insecure dev default
  specifically so it's obvious this must be overridden.

### 4. Evidence integrity
Every uploaded evidence file is SHA-256 hashed on arrival
(`services/hashing_service.py`). The hash travels with the evidence record,
so tampering after upload is detectable — this supports chain-of-custody for
anything used in a legal process later.

### 5. Access control
- Every route derives `user_id` from the verified JWT, never from the
  request body or path in a way that lets one user act as another.
- `GET /api/case/{user_id}` explicitly checks `user_id == current_user.id`
  and returns `403` otherwise.
- Evidence and incident lookups are always scoped with
  `.filter(..., user_id == current_user.id)` — a stolen incident_id alone
  doesn't leak another user's data.

### 6. Guardian Vault recovery
- The backup blob is opaque ciphertext to the Guardian.
- Recovery requires a one-time-shown recovery code, stored only as a bcrypt
  hash (`recovery_code_hash`) — even a database leak doesn't expose usable
  recovery codes.
- Recovery is intentionally unauthenticated (no JWT) since it exists for the
  exact scenario where the survivor has no working account/device — but it
  is still gated by possession of the correct code.

### 7. Consent-scoped handoff
`POST /api/handoff/generate` filters incidents server-side by
`consented_categories` and empties the `evidence` array when
`include_evidence` is false. This is enforced in the API, not just hidden in
the frontend — a modified/malicious client still can't over-share.

## What's NOT protected today (be honest about this in the demo)

- **No encryption of category booleans / dates / location** — see caveat above.
- **No transport security configured by default** — `uvicorn` runs plain
  HTTP locally; a real deployment MUST run behind HTTPS/TLS (e.g. via a
  reverse proxy or hosting platform that terminates TLS).
- **No rate limiting** on login, registration, or Guardian recovery —
  a determined attacker could brute-force a weak password or attempt many
  recovery codes. Recovery codes are 8 random alphanumeric characters from a
  36-symbol alphabet (~41 bits of entropy) which is reasonable but not
  bulletproof without rate limiting.
- **No audit log** of who accessed what, when — relevant for both debugging
  and for a survivor wanting to know if their Guardian Vault was accessed.
- **No secure deletion** — deleting a user currently relies on cascading DB
  deletes; underlying evidence files on disk are not yet securely wiped.
- **No device-level protections** (screen recording prevention, jailbreak/
  root detection, secure enclave key storage) — these matter a lot given the
  threat model and are listed in `future-scope.md`.
- **Single ENCRYPTION_KEY for all users** — if it's ever rotated without a
  migration, all previously encrypted data becomes unreadable
  (`InvalidToken` is raised loudly by design, not silently swallowed).

## Guidance for anyone extending this code

- Never log incident descriptions, evidence contents, or decrypted Guardian
  backups, even at DEBUG level.
- Never add an endpoint that returns another user's data without an
  explicit, reviewed reason — the current codebase has zero such endpoints
  and that should stay true.
- If you add a new sensitive field, encrypt it the same way `description` is
  encrypted, not as an afterthought.
- Treat `ENCRYPTION_KEY` and `SECRET_KEY` like production secrets from day
  one, even during the hackathon — bad habits here are exactly the kind that
  make it into production.
