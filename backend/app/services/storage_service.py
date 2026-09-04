"""
File storage abstraction. Currently backed by local disk under UPLOAD_DIR so
the hackathon demo needs zero cloud setup. Swap `save_file`/`read_file` for
S3/GCS calls in production without touching route code.
"""
import os
import uuid

from app.config import get_settings
from app.utils.helpers import safe_filename

settings = get_settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


def save_file(user_id: str, incident_id: str, original_filename: str, content: bytes) -> str:
    """Writes bytes to disk under a per-user/per-incident folder and returns the stored path."""
    folder = os.path.join(settings.UPLOAD_DIR, user_id, incident_id)
    os.makedirs(folder, exist_ok=True)

    unique_name = f"{uuid.uuid4().hex[:8]}_{safe_filename(original_filename or 'file')}"
    full_path = os.path.join(folder, unique_name)

    with open(full_path, "wb") as f:
        f.write(content)

    return full_path


def read_file(stored_path: str) -> bytes:
    with open(stored_path, "rb") as f:
        return f.read()


def delete_file(stored_path: str) -> None:
    if stored_path and os.path.exists(stored_path):
        os.remove(stored_path)

