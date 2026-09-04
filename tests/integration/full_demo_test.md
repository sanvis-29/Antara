# Full Demo Integration Test

Run this against a live backend (`uvicorn app.main:app --reload --port 8000`)
before every milestone demo. Every step should succeed in order.

## 0. Health check
```bash
curl http://localhost:8000/health
# {"status":"healthy"}
```

## 1. Register a survivor account
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"meena_demo","password":"password123","unlock_pin":"1234"}'
```
Save `access_token` and `user.id` from the response.

## 2. Core milestone: submit the incident
```bash
curl -X POST http://localhost:8000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "description": "My husband hit me, took my card and threatened to share our private video.",
    "date": "2026-08-18",
    "time": "21:30",
    "location": "home",
    "people_involved": [{"role": "husband"}],
    "categories": {"physical": true, "economic": true, "digital": true},
    "economic_details": {"money_controlled": true, "card_withheld": true, "amount": null},
    "digital_details": {"platform": "WhatsApp", "private_content_threat": true}
  }'
```
Save `incident_id`. Expect all three category booleans to come back `true`.

## 3. Person 2's tagging step
```bash
curl -X POST http://localhost:8000/api/case/structure \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"incident_id\": \"$INC_ID\"}"
```
Expect `ai_classification.tags` to contain `physical`, `economic`, `digital`.
**This is the round-trip that proves the architecture is alive.**

## 4. Case record reflects it
```bash
curl http://localhost:8000/api/case/$USER_ID -H "Authorization: Bearer $TOKEN"
```
Expect `tags` to include all three categories and `readiness_score > 0`.

## 5. Evidence upload
```bash
curl -X POST http://localhost:8000/api/evidence \
  -H "Authorization: Bearer $TOKEN" \
  -F "incident_id=$INC_ID" \
  -F "type=bank_sms" \
  -F "notes=card withdrawal alert" \
  -F "file=@sample.txt"
```
Expect a `sha256_hash` in the response.

## 6. Generate a pack
```bash
curl -X POST http://localhost:8000/api/packs/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"pack_type":"economic_pack"}'
```
Expect `incident_count >= 1` and a `totals` object.

## 7. Support recommendations
```bash
curl http://localhost:8000/api/support/recommendations -H "Authorization: Bearer $TOKEN"
```
Expect providers spanning police/shelter/medical/counseling/legal/cybe