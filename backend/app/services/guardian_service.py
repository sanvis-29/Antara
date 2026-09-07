"""
Guardian Vault

Creates an encrypted snapshot of a survivor's case so the primary device
is not the single point of failure.

The Guardian provides redundancy, not readable access.

For this prototype, recovery is authorised using the survivor's private PIN.
The PIN is verified using a secure hash; it is never stored in plaintext.
The server-side Fernet key performs encryption/decryption of the vault.
"""

import json
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.guardian import Guardian
from app.models.incident import Incident
from app.models.user import User
from app.services.encryption_services import encrypt_text, decrypt_text
from app.utils.security import hash_password, verify_password


def build_backup_snapshot(db: Session, user_id: str) -> dict:
    """Collect the case information required for the prototype backup."""

    incidents = (
        db.query(Incident)
        .filter(Incident.user_id == user_id)
        .all()
    )

    snapshot_incidents = [
        inc.to_contract_dict(
            decrypt_text(inc.description_encrypted)
        )
        for inc in incidents
    ]

    return {
        "user_id": user_id,
        "backed_up_at": datetime.now(timezone.utc).isoformat(),
        "incidents": snapshot_incidents,
    }


def create_backup(
    db: Session,
    user_id: str,
    guardian_name: str,
    guardian_contact: str | None,
    unlock_pin: str,
) -> Guardian:
    """
    Create/update an encrypted Guardian backup.

    The first PIN used for Guardian Vault becomes the survivor's private
    Guardian-Vault PIN for this prototype. Later backups must use the same PIN.
    """

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise ValueError("User not found.")

    # Establish the private PIN if one has not yet been configured.
    if not user.hashed_unlock_pin:
        user.hashed_unlock_pin = hash_password(unlock_pin)

    elif not verify_password(
        unlock_pin,
        user.hashed_unlock_pin,
    ):
        raise ValueError("Incorrect private PIN.")

    snapshot = build_backup_snapshot(db, user_id)

    # The backup itself is encrypted using ANTARA's persisted Fernet key.
    blob = encrypt_text(json.dumps(snapshot))

    guardian = (
        db.query(Guardian)
        .filter(
            Guardian.user_id == user_id,
            Guardian.contact == guardian_contact,
        )
        .first()
    )

    if not guardian:
        guardian = Guardian(
            user_id=user_id,
            name=guardian_name,
            contact=guardian_contact,
        )
        db.add(guardian)

    guardian.name = guardian_name
    guardian.contact = guardian_contact
    guardian.backup_blob_encrypted = blob
    guardian.last_backup_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(guardian)

    return guardian


def recover_backup(
    db: Session,
    guardian_id: str,
    unlock_pin: str,
) -> dict:
    """
    Recover an encrypted Guardian backup using the survivor's private PIN.

    The Guardian ID locates the encrypted vault.
    The survivor's PIN authorises access.
    """

    guardian = (
        db.query(Guardian)
        .filter(Guardian.guardian_id == guardian_id)
        .first()
    )

    if not guardian or not guardian.backup_blob_encrypted:
        raise ValueError("No Guardian backup found.")

    user = (
        db.query(User)
        .filter(User.id == guardian.user_id)
        .first()
    )

    if not user or not user.hashed_unlock_pin:
        raise ValueError("Private PIN is not configured.")

    if not verify_password(
        unlock_pin,
        user.hashed_unlock_pin,
    ):
        raise ValueError("Incorrect private PIN.")

    plain_json = decrypt_text(
        guardian.backup_blob_encrypted
    )

    return json.loads(plain_json)