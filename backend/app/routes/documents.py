from app.models.documents import Document, DocumentType
from app.models.user import User
from app.schemas.documents import (
    DocumentCreateResponse,
    DocumentListResponse,
    DocumentMetadata,
)
from app.services.encryption_services import encrypt_bytes
from app.services.storage_service import save_file, delete_file

router = APIRouter(
    prefix="/api/documents",
    tags=["documents"],
)


@router.post(
    "",
    response_model=DocumentCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    document_type: DocumentType = Form(...),
    label: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="A file is required.",
        )

    label = label.strip()

    if not label:
        raise HTTPException(
            status_code=400,
            detail="Document label is required.",
        )

    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    # Hash original bytes so integrity can later be checked.
    sha256_hash = hashlib.sha256(file_bytes).hexdigest()

    # Encrypt BEFORE writing anything to disk.
    encrypted_bytes = encrypt_bytes(file_bytes)

    storage_key = save_file(
        user_id=current_user.id,
        incident_id="essential_documents",
        original_filename=f"{file.filename}.encrypted",
        content=encrypted_bytes,
    )

    doc = Document(
        user_id=current_user.id,
        document_type=document_type,
        label=label,
        original_filename=file.filename,
        encrypted_storage_key=storage_key,
        sha256_hash=sha256_hash,
    )

    try:
        db.add(doc)
        db.commit()
        db.refresh(doc)

    except Exception:
        db.rollback()
        delete_file(storage_key)
        raise

    return doc


@router.get(
    "",
    response_model=DocumentListResponse,
)
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    docs = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
        .all()
    )

    return DocumentListResponse(
        user_id=current_user.id,
        documents=[
            DocumentMetadata.model_validate(doc)
            for doc in docs
        ],
    )


@router.get(
    "/{document_id}",
    response_model=DocumentMetadata,
)
def get_document_metadata(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = (
        db.query(Document)
        .filter(
            Document.document_id == document_id,
            Document.user_id == current_user.id,
        )
        .first()
    )

    if doc is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    return doc


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = (
        db.query(Document)
        .filter(
            Document.document_id == document_id,
            Document.user_id == current_user.id,
        )
        .first()
    )

    if doc is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    storage_key = doc.encrypted_storage_key

    db.delete(doc)
    db.commit()

    delete_file(storage_key)

    return None

