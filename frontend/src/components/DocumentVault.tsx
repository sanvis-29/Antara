import {
  useEffect,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  deleteDocument,
  getDocuments,
  uploadDocument,
  type DocumentType,
  type EssentialDocument,
} from "../services/documentApi";

const DOCUMENT_TYPES: Array<{
  value: DocumentType;
  label: string;
  short: string;
}> = [
  {
    value: "aadhaar",
    label: "Aadhaar Card",
    short: "ID",
  },
  {
    value: "pan",
    label: "PAN Card",
    short: "ID",
  },
  {
    value: "passport",
    label: "Passport",
    short: "ID",
  },
  {
    value: "driving_licence",
    label: "Driving Licence",
    short: "ID",
  },
  {
    value: "bank_passbook",
    label: "Bank Passbook",
    short: "BANK",
  },
  {
    value: "debit_card_reference",
    label: "Debit Card Reference",
    short: "BANK",
  },
  {
    value: "marriage_certificate",
    label: "Marriage Certificate",
    short: "LEGAL",
  },
  {
    value: "child_document",
    label: "Child Document",
    short: "FAMILY",
  },
  {
    value: "medical_record",
    label: "Medical Record",
    short: "MED",
  },
  {
    value: "other",
    label: "Other Document",
    short: "DOC",
  },
];

function getTypeInfo(type: DocumentType) {
  return (
    DOCUMENT_TYPES.find(
      (item) => item.value === type
    ) ?? DOCUMENT_TYPES[9]
  );
}

export default function DocumentVault() {
  const [documents, setDocuments] = useState<
    EssentialDocument[]
  >([]);

  const [documentType, setDocumentType] =
    useState<DocumentType>("aadhaar");

  const [label, setLabel] = useState("");
  const [file, setFile] = useState<File | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] =
    useState(false);

  const [deleting, setDeleting] = useState<
    string | null
  >(null);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  async function loadDocuments() {
    try {
      setError(null);

      const result = await getDocuments();

      setDocuments(result.documents);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "ANTARA couldn't load your documents."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleUpload() {
    if (!file) {
      setError("Choose a document first.");
      return;
    }

    if (!label.trim()) {
      setError(
        "Give this document a private label."
      );
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      await uploadDocument(
        documentType,
        label.trim(),
        file
      );

      await loadDocuments();

      setLabel("");
      setFile(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      setSuccess(
        "Protected copy added to your document vault."
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "ANTARA couldn't protect this document."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(
    documentId: string
  ) {
    try {
      setDeleting(documentId);
      setError(null);
      setSuccess(null);

      await deleteDocument(documentId);

      setDocuments((current) =>
        current.filter(
          (doc) =>
            doc.document_id !== documentId
        )
      );

      setSuccess(
        "Document removed from this vault."
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "ANTARA couldn't remove this document."
      );
    } finally {
      setDeleting(null);
    }
  }

  return (
    <section className="document-vault">
      <div className="document-vault-heading">
        <div>
          <span>ESSENTIAL DOCUMENTS</span>

          <h2>
            What if you have to leave without them?
          </h2>

          <p>
            Keep protected digital copies of documents
            that may be difficult or unsafe to retrieve
            later.
          </p>
        </div>

        <div className="document-count">
          <strong>{documents.length}</strong>
          <span>
            {documents.length === 1
              ? "protected copy"
              : "protected copies"}
          </span>
        </div>
      </div>

      <div className="document-boundary">
        <span>◇</span>

        <p>
          Adding a document does not send it to a
          Guardian, counselor, authority or support
          service. It remains part of your protected
          ANTARA storage.
        </p>
      </div>

      <div className="document-upload-panel">
        <div className="document-field">
          <label htmlFor="document-type">
            DOCUMENT TYPE
          </label>

          <select
            id="document-type"
            value={documentType}
            onChange={(event) =>
              setDocumentType(
                event.target.value as DocumentType
              )
            }
          >
            {DOCUMENT_TYPES.map((type) => (
              <option
                key={type.value}
                value={type.value}
              >
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="document-field">
          <label htmlFor="document-label">
            PRIVATE LABEL
          </label>

          <input
            id="document-label"
            value={label}
            onChange={(event) =>
              setLabel(event.target.value)
            }
            placeholder="e.g. My Aadhaar"
          />
        </div>

        <div className="document-file-area">
          <input
            ref={inputRef}
            id="document-file"
            type="file"
            className="document-file-input"
            onChange={(event) => {
              setFile(
                event.target.files?.[0] ?? null
              );
              setError(null);
              setSuccess(null);
            }}
          />

          <label
            htmlFor="document-file"
            className={`document-file-picker ${
              file
                ? "document-file-selected"
                : ""
            }`}
          >
            <div className="document-file-icon">
              {file ? "✓" : "+"}
            </div>

            <div>
              <strong>
                {file
                  ? file.name
                  : "Choose document"}
              </strong>

              <span>
                {file
                  ? `${(
                      file.size /
                      1024 /
                      1024
                    ).toFixed(2)} MB selected`
                  : "Select a protected copy to add"}
              </span>
            </div>
          </label>
        </div>

        {error && (
          <div className="document-message document-error">
            {error}
          </div>
        )}

        {success && (
          <div className="document-message document-success">
            ✓ {success}
          </div>
        )}

        <button
          className="document-upload-button"
          disabled={
            uploading ||
            !file ||
            !label.trim()
          }
          onClick={handleUpload}
        >
          {uploading
            ? "Protecting..."
            : "Add Protected Copy →"}
        </button>
      </div>

      <div className="document-list-heading">
        <span>YOUR PROTECTED COPIES</span>

        <p>
          Only document metadata is displayed here.
        </p>
      </div>

      {loading ? (
        <div className="document-loading">
          <div className="navigate-loader" />
          Loading protected documents…
        </div>
      ) : documents.length === 0 ? (
        <div className="document-empty">
          <span>◇</span>

          <div>
            <strong>
              No documents added yet.
            </strong>

            <p>
              Your document vault will appear here
              when you add your first protected copy.
            </p>
          </div>
        </div>
      ) : (
        <div className="document-grid">
          <AnimatePresence>
            {documents.map((doc, index) => {
              const type = getTypeInfo(
                doc.document_type
              );

              return (
                <motion.article
                  key={doc.document_id}
                  className="document-card"
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.97,
                  }}
                  transition={{
                    delay: index * 0.04,
                  }}
                >
                  <div className="document-card-top">
                    <span className="document-type-mark">
                      {type.short}
                    </span>

                    <span className="document-protected">
                      ● PROTECTED
                    </span>
                  </div>

                  <h3>{doc.label}</h3>

                  <p>{type.label}</p>

                  <div className="document-card-footer">
                    <span>
                      Added{" "}
                      {new Date(
                        doc.created_at
                      ).toLocaleDateString()}
                    </span>

                    <button
                      disabled={
                        deleting ===
                        doc.document_id
                      }
                      onClick={() =>
                        handleDelete(
                          doc.document_id
                        )
                      }
                    >
                      {deleting ===
                      doc.document_id
                        ? "Removing..."
                        : "Remove"}
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}