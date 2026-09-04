import json
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db, SessionLocal
from app.models.support_provider import SupportProvider
from app.routes import (
    auth,
    incident,
    evidence,
    case,
    guardian,
    packs,
    support,
    documents,
)

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)

# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------
# Allow the local Vite frontend during development.
# This supports both localhost and 127.0.0.1 on any port.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# ROUTES
# ---------------------------------------------------------
app.include_router(auth.router)
app.include_router(incident.router)
app.include_router(evidence.router)
app.include_router(case.router)
app.include_router(guardian.router)
app.include_router(packs.router)
app.include_router(support.router)
app.include_router(documents.router)


def _seed_support_providers() -> None:
    """
    Load verified support services from
    data/verified_services/delhi_services.json
    into the database on first startup.
    """

    seed_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
        "data",
        "verified_services",
        "delhi_services.json",
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

        for provider in providers:
            db.add(SupportProvider(**provider))

        db.commit()

    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    init_db()
    _seed_support_providers()


@app.get("/")
def root():
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get("/health")
def health():
    return {"status": "healthy"}