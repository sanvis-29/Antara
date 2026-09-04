import hashlib

from fastapi import APIRouter, Depends, HTTPException, UploadFile, Form, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.document import Document, DocumentType
from app.schemas.document import (
    DocumentCreateResponse,
    DocumentListResponse,
    DocumentMetadata,
)
from app.services.encryption_service import encrypt_and_store
from app.services.storage_service import delete_blob

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post("", response_model=DocumentCreateResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    document_type: DocumentType = Form(...),
    label: str = Form(...),
    file: UploadFile = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    file_bytes = await file.read()
    sha256_hash = hashlib.sha256(file_bytes).hexdigest()
    storage_key = encrypt_and_store(
        user_id=current_user.user_id, filename=file.filename, data=file_bytes
    )

    doc = Document(
        user_id=current_user.user_id,
        document_type=document_type,
        label=label,
        original_filename=file.filename,
        encrypted_storage_key=storage_key,
        sha256_hash=sha256_hash,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("", response_model=DocumentListResponse)
def list_documents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    docs = db.query(Document).filter(Document.user_id == current_user.user_id).all()
    return DocumentListResponse(
        user_id=current_user.user_id,
        documents=[DocumentMetadata.model_validate(d) for d in docs],
    )


@router.get("/{document_id}", response_model=DocumentMetadata)
def get_document_metadata(
    document_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.document_id == document_id).first()
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not your document")
    return doc


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.document_id == document_id).first()
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not your document")

    delete_blob(doc.encrypted_storage_key)
    db.delete(doc)
    db.commit()