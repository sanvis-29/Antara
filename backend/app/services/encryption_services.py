"""
Symmetric encryption for sensitive fields at rest: incident descriptions,
Guardian Vault backups, and anything else that must never sit in the DB
as plaintext.

Uses Fernet (AES-128-CBC + HMAC) from the `cryptography` package.
"""

from cryptography.fernet import Fernet, InvalidToken

from app.config import get_settings


settings = get_settings()
_fernet = Fernet(settings.encryption_key)


def encrypt_text(plain_text: str | None) -> str | None:
    """Encrypt plaintext using the configured Fernet key."""
    if plain_text is None:
        return None

    return _fernet.encrypt(
        plain_text.encode("utf-8")
    ).decode("utf-8")


def decrypt_text(cipher_text: str | None) -> str | None:
    """Decrypt Fernet ciphertext using the configured encryption key."""
    if cipher_text is None:
        return None

    try:
        return _fernet.decrypt(
            cipher_text.encode("utf-8")
        ).decode("utf-8")

    except InvalidToken as exc:
        # Data was encrypted with a different key
        # or the ciphertext is corrupted.
        raise ValueError(
            "Unable to decrypt data: invalid or missing encryption key."
        ) from exc


def encrypt_bytes(data: bytes) -> bytes:
    """Encrypt raw file bytes using the configured Fernet key."""
    return _fernet.encrypt(data)


def decrypt_bytes(cipher_data: bytes) -> bytes:
    """Decrypt encrypted file bytes using the configured Fernet key."""
    try:
        return _fernet.decrypt(cipher_data)
    except InvalidToken as exc:
        raise ValueError(
            "Unable to decrypt file: invalid or missing encryption key."
        ) from exc

