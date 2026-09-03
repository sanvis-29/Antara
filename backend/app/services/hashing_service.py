"""
SHA-256 hashing for evidence integrity / chain-of-custody. Any evidence file
gets hashed on upload; the hash can later be used to prove the file hasn't
been tampered with (e.g. for a legal/DV evidence pack).
"""
import hashlib


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: str, chunk_size: int = 65536) -> str:
    hasher = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(chunk_size):
            hasher.update(chunk)
    return hasher.hexdigest()