# ANTARA Intelligence (Person 2)

Case classification, entity extraction, incident linking, readiness
scoring, the Support Navigator, and pack generation. Every module here
operates on **plain dicts** matching the frozen schemas in
`shared/schemas/` — nothing here imports FastAPI, SQLAlchemy, or anything
backend-specific, so it can be developed and tested standalone.

## Layout

```
intelligence/
├── case_engine/
│   ├── classifier.py     physical/economic/digital tagging
│   ├── extractor.py      pulls roles, platforms, amounts, threats from text
│   ├── linker.py         links evidence to incidents, builds timelines,
│   │                     groups incidents by person involved
│   └── readiness.py      explainable 0-100 case-readiness score
│
├── navigator/
│   ├── rules.py          category -> provider-type mapping, urgency detection
│   ├── reasoning.py      turns rules into plain-language explanations
│   └── recommender.py    main entry point: incidents + providers -> ranked, explained list
│
├── pack_generation/
│   ├── dv_pack.py        physical-incident pack + narrative summary
│   ├── economic_pack.py  economic-incident pack + totals + narrative summary
│   └── cyber_pack.py     digital-incident pack + platforms/threats + narrative summary
│
├── prompts/
│   ├── incident_structuring.txt   prompt template for a future LLM-based classifier
│   └── support_explanation.txt    prompt template for a future LLM-based explainer
│
└── tests/
    ├── test_classifier.py
    └── test_navigator.py
```

## Running standalone

Every module has a `__main__` block with a runnable example:
```bash
cd antara
python -m intelligence.case_engine.classifier
python -m intelligence.navigator.recommender
python -m intelligence.pack_generation.dv_pack
```

## Running tests

```bash
cd antara
pip install pytest
pytest intelligence/tests/ -v
```

## How this plugs into the backend

The backend currently ships with lightweight rule-based fallbacks so the API
works standalone (see `backend/README.md`'s "Swapping in Person 2's real
classifier" section):

| Backend fallback | Replace with |
|---|---|
| `routes/case.py::_fallback_classify` | `case_engine.classifier.classify_incident` |
| `routes/case.py::_recompute_readiness` | `case_engine.readiness.compute_readiness` |
| `routes/support.py`'s inline category filter | `navigator.recommender.recommend` |
| `services/pack_service.py`'s inline pack assembly | `pack_generation.dv_pack` / `economic_pack` / `cyber_pack` |

All of these keep the same input/output shape as the fallback they replace,
so swapping them in is a matter of importing and calling — no route
signatures or response schemas need to change.

## The prompts/ folder

These are **not currently called by any code** — they're prepared prompt
templates for the LLM-based upgrade path described in `docs/future-scope.md`
(replacing the keyword-based classifier and hand-written reasoning strings
with a model-backed version). They're checked in now so the prompt design
can be reviewed and iterated on independently of when the integration work
happens.

## Design principle: explainability over cleverness

Every score and recommendation in this package can point to *why* it came
out the way it did — `classifier.py` returns matched keywords,
`readiness.py` returns a per-factor breakdown, `reasoning.py` explains each
suggested provider in plain language. A survivor or advocate should never
have to trust a black-box number. Keep this property when extending or
replacing any of these modules.
