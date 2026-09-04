# Demo Flow

A ~5 minute walkthrough for judges. Keep narration calm and matter-of-fact —
this is safety-critical software, not a flashy consumer app.

## 0. Setup (before judges arrive)

- Backend running (`uvicorn app.main:app`), seeded with verified services.
- Frontend running, logged out, showing the disguised entry screen.
- Have a demo account ready (or register live — either works).

## 1. The disguise (30s)

> "This looks like a simple game. That's intentional — if someone checks a
> survivor's phone, there's nothing alarming to see."

- Show `/game`. Play a couple of moves.
- Perform the secret unlock gesture/PIN entry.
- Land on `/dashboard`.

## 2. Logging an incident (60s)

> "Logging an incident should take under a minute, even under stress."

- Go to `/incidents/new`.
- Fill in the milestone example:
  *"My husband hit me, took my card and threatened to share our private video."*
- Tick physical / economic / digital, fill in the economic and digital
  detail fields, submit.
- Point out: the description is encrypted before it ever touches the database.

## 3. AI classification (30s)

> "The system doesn't just store this — it structures it."

- Show the incident card updating with `Physical ✓ Economic ✓ Digital ✓`.
- Mention this is the same round-trip the team tested first, before building
  anything else: submit → store → classify → display.

## 4. Evidence + Case Readiness (45s)

- Upload a sample screenshot/bank SMS as evidence on that incident.
- Navigate to the Case Record screen.
- Point out the readiness score moving up as evidence and corroborating
  categories accumulate — "this isn't just a checklist, it's telling the
  survivor how strong their documented case actually is."

## 5. Support Navigator (30s)

> "Once the system knows what kind of abuse is involved, it can point to the
> right kind of help — not a generic hotline list."

- Show `/support` recommending police/shelter/medical for physical,
  legal/financial for economic, cyber crime cell for digital.

## 6. Packs (30s)

- Generate a DV pack or economic pack live.
- Show the structured export — dates, evidence references, category tags —
  "this is what a survivor could hand to a lawyer or the police, already organized."

## 7. Guardian Vault (45s)

> "Phones get lost, seized, or wiped. This is the safety net."

- Back up to a Guardian (a trusted contact), show the recovery code appear
  exactly once.
- Simulate a lost device: recover using just the Guardian ID + recovery code,
  no login needed, show the case data comes back intact.

## 8. Consent-based Handoff (30s)

> "Nothing leaves this app without the survivor explicitly saying so."

- Go to the Handoff/consent screen, tick only "physical" and "economic",
  leave evidence out.
- Generate the handoff bundle, show digital-category incidents are absent
  and evidence is empty — enforced by the backend, not just hidden in the UI.

## 9. Quick Exit (10s)

- Hit Quick Exit from anywhere in the app, land back on something innocuous
  instantly.

## Closing line

> "Every piece of this — the disguise, the categorization, the readiness
> score, the Guardian backup, the consent gate — exists because of one
> constraint: this has to be safe to use in the room with the abuser."

## If something breaks live

- Fall back to the fixture data in `data/demo/` (`meena_incidents.json`,
  `meena_case.json`) — these render the same screens without needing a live
  backend call.
- Never apologize at length; say "let me show you that from our test data"
  and move on.
