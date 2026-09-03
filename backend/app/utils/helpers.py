import re
from datetime import datetime, timezone


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def is_valid_date_str(value: str) -> bool:
    return bool(re.match(r"^\d{4}-\d{2}-\d{2}$", value or ""))


def is_valid_time_str(value: str) -> bool:
    if value is None:
        return True
    return bool(re.match(r"^\d{2}:\d{2}$", value))


def safe_filename(filename: str) -> str:
    """Strip path separators and odd characters from an uploaded filename."""
    filename = filename.replace("\\", "/").split("/")[-1]
    return re.sub(r"[^A-Za-z0-9._-]", "_", filename)[:200]
