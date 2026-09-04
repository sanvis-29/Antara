import { apiRequest } from "./api";

export type DocumentType =
  | "aadhaar"
  | "pan"
  | "passport"
  | "driving_licence"
  | "bank_passbook"
  | "debit_card_reference"
  | "marriage_certificate"
  | "child_document"
  | "medical_record"
  | "other";

export interface EssentialDocument {
  document_id: string;
  document_type: DocumentType;
  label: string;
  created_at: string;
}

export interface DocumentListResponse {
  user_id: string;
  documents: EssentialDocument[];
}

export interface UploadedDocument {
  document_id: string;
  user_id: string;
  document_type: DocumentType;
  label: string;
  original_filename: string;
  sha256_hash: string;
  created_at: string;
}

export async function getDocuments() {
  return apiRequest<DocumentListResponse>(
    "/api/documents"
  );
}

export async function uploadDocument(
  documentType: DocumentType,
  label: string,
  file: File
) {
  const formData = new FormData();

  formData.append("document_type", documentType);
  formData.append("label", label);
  formData.append("file", file);

  return apiRequest<UploadedDocument>(
    "/api/documents",
    {
      method: "POST",
      body: formData,
    }
  );
}

export async function deleteDocument(
  documentId: string
) {
  return apiRequest<void>(
    `/api/documents/${documentId}`,
    {
      method: "DELETE",
    }
  );
}