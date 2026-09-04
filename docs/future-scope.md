# Future Scope

Ideas explicitly out of scope for the hackathon build, kept here so they
don't get lost — and so nobody feels pressure to build them under deadline.

## Intelligence

- Replace `intelligence/case_engine/classifier.py`'s keyword/rule-based
  approach with a fine-tuned or prompt-based LLM classifier, trained/prompted
  on anonymized, consented incident narratives.
- Multi-incident pattern detection: escalation trends over time, recurring
  people/platforms across incidents, cross-incident corroboration scoring.
- Multilingual incident structuring (Hindi, Hinglish, regional languages) —
  survivors should not have to describe trauma in English.
- Confidence-aware UI: let the survivor confirm/correct AI tags rather than
  silently trusting them, especially at low confidence.

## Security & Trust

- Move evidence file storage to encrypted-at-rest object storage (S3/GCS with
  server-side encryption + per-file keys), not just hashed.
- Client-side (end-to-end) encryption option, where even the backend never
  sees plaintext incident descriptions — trades some server-side
  classification ability for stronger privacy guarantees.
- Biometric unlock as an alternative/addition to the PIN-based secret entry.
- Panic-triggered remote wipe: a duress PIN that shows fake data instead of
  real data under coercion, rather than just exiting.
- Rate limiting and anomaly detection on `/api/guardian/recover` to slow
  down brute-force recovery code guessing.

## Guardian Vault

- Multiple Guardians per user with threshold recovery (e.g. 2-of-3 Guardians
  must approve a recovery request).
- Guardian notification system (SMS/email) when a backup or recovery happens,
  so Guardians know their vault was accessed.
- Automatic periodic backups rather than manual "Backup now."

## Support Navigator

- Real-time verified service availability (open/closed, wait times) via
  partner APIs rather than a static seeded dataset.
- Geolocation-based ranking, with an explicit opt-in since location data is
  sensitive for this user base.
- Direct in-app connection to a counselor (chat/call) rather than just phone
  numbers.

## Packs

- PDF export (not just structured JSON) formatted for direct submission to
  police, courts, or legal aid — this is the natural next step once the docx/pdf
  skill or an equivalent is wired into the pipeline.
- Digital signature / notarization-style timestamping on generated packs, so
  their evidence-of-integrity (SHA-256 hash chain) can be independently verified.

## Platform

- Native mobile app (the disguise mechanic and Quick Exit both benefit from
  OS-level integration — e.g. faking a lock screen, hiding from the recent-apps switcher).
- Offline-first mode: log incidents with no network connection, sync when safe.
- Accessibility audit (screen reader support, high-contrast mode, and options
  for survivors with limited literacy).

## Data & Compliance

- Formal data retention policy and a self-serve "delete everything" flow.
- Jurisdiction-specific legal review (evidence chain-of-custody requirements
  vary significantly by state/country).
- Partnership with verified NGOs/legal aid orgs to keep the support-provider
  dataset current, rather than manually maintained JSON.
