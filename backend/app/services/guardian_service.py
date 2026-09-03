"""
Guardian Vault: lets a survivor back up an encrypted snapshot of their case
data to a trusted contact ("Guardian"), and recover it later using a
recovery code -- e.g. after a phone is lost, seized, or wiped.
"""
import json
import secrets
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.guardian import Guardian
from app.models.incident import Incident
from app.services.encryption_service import encrypt_text, decrypt_text
from app.utils.security import hash_password, verify_password


def generate_recovery_code() -> str:
    """A short human-typeable recovery code, e.g. 'X7K2-9PLQ'."""
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no ambiguous chars
    code = "".join(secrets.choice(alphabet) for _ in range(8))
    return f"{code[:4]}-{code[4:]}"


def build_backup_snapshot(db: Session, user_id: str) -> dict:
    """Collects the minimum data needed to reconstruct a user's case on recovery."""
    incidents = db.query(Incident).filter(Incident.user_id == user_id).all()
    snapshot_incidents = [
        inc.to_contract_dict(decrypt_text(inc.description_encrypted))
        for inc in incidents
    ]

    return {
        "user_id": user_id,
        "backed_up_at": datetime.now(timezone.utc).isoformat(),
        "incidents": snapshot_incidents,
    }


def create_backup(db: Session, user_id: str, guardian_name: str, guardian_contact: str) -> tuple[Guardian, str]:
    """Creates or updates a Guardian record with an encrypted backup blob.
    Returns the Guardian row and the plaintext recovery code (shown once)."""
    snapshot = build_backup_snapshot(db, user_id)
    blob = encrypt_text(json.dumps(snapshot))
    recovery_code = generate_recovery_code()

    # Check if a record already exists for this guardian contact
    guardian = (
        db.query(Guardian)
        .filter(Guardian.user_id == user_id, Guardian.contact == guardian_contact)
        .first()
    )

    if not guardian:
        guardian = Guardian(user_id=user_id, name=guardian_name, contact=guardian_contact)
        db.add(guardian)

    guardian.name = guardian_name
    guardian.backup_blob_encrypted = blob
    guardian.recovery_code_hash = hash_password(recovery_code)
    guardian.last_backup_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(guardian)

    return guardian, recovery_code


def recover_backup(db: Session, user_id: str, guardian_id: str, recovery_code: str) -> dict:
    """Validates the recovery code for a specific user and returns the decrypted snapshot."""
    guardian = (
        db.query(Guardian)
        .filter(Guardian.guardian_id == guardian_id, Guardian.user_id == user_id)
        .first()
    )
    
    if not guardian or not guardian.backup_blob_encrypted:
        raise ValueError("No backup found for this Guardian.")

    if not guardian.recovery_code_hash or not verify_password(recovery_code, guardian.recovery_code_hash):
        raise ValueError("Invalid recovery code.")

    plain_json = decrypt_text(guardian.backup_blob_encrypted)
    return json.loads(plain_json)