import json
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db, SessionLocal
from app.models.support_provider import SupportProvider
from app.routes import auth, incidents, evidence, case, guardian, packs, support

settings = get_settings()

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(incidents.router)
app.include_router(evidence.router)
app.include_router(case.router)
app.include_router(guardian.router)
app.include_router(packs.router)
app.include_router(support.router)


def _seed_support_providers() -> None:
    """Loads verified services from data/verified_services/delhi_services.json
    into the DB on first startup, if the table is empty."""
    seed_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "data", "verified_services", "delhi_services.json"
    )
    seed_path = os.path.abspath(seed_path)
    if not os.path.exists(seed_path):
        return

    db = SessionLocal()
    try:
        if db.query(SupportProvider).count() > 0:
            return

        with open(seed_path, "r", encoding="utf-8") as f:
            providers = json.load(f)

        for p in providers:
            db.add(SupportProvider(**p))
        db.commit()
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    init_db()
    _seed_support_providers()


@app.get("/")
def root():
    return {"status": "ok", "service": settings.APP_NAME, "version": settings.APP_VERSION}


@app.get("/health")
def health():
    return {"status": "healthy"}