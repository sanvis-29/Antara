import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  createGuardianBackup,
  type GuardianBackupResponse,
} from "../services/guardianApi";

interface Props {
  incidentCount: number;
  onBack: () => void;
  onQuickExit: () => void;
  onContinue: () => void;
}

export default function PreserveCase({
  incidentCount,
  onBack,
  onQuickExit,
  onContinue,
}: Props) {
  const [guardianName, setGuardianName] = useState("");
  const [guardianContact, setGuardianContact] = useState("");

  const [backup, setBackup] =
    useState<GuardianBackupResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createBackup = async () => {
    if (!guardianName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await createGuardianBackup({
        guardian_name: guardianName.trim(),
        guardian_contact:
          guardianContact.trim() || null,
      });

      setBackup(result);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "ANTARA couldn't create this protected copy."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyRecoveryCode = async () => {
    if (!backup) return;

    try {
      await navigator.clipboard.writeText(
        backup.recovery_code
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <motion.main
      className="preserve-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="antara-header">
        <div className="antara-brand">
          <div className="antara-logo">A</div>

          <div>
            <span>ANTARA</span>
            <small>PRESERVE</small>
          </div>
        </div>

        <button
          className="quick-exit"
          onClick={onQuickExit}
        >
          Quick Exit
        </button>
      </header>

      <div className="preserve-layout">
        <aside className="preserve-intro">
          <button
            className="back-link"
            onClick={onBack}
          >
            ← Back
          </button>

          <p className="dashboard-kicker">
            03 — PRESERVE
          </p>

          <h1>
            Your phone should not be the{" "}
            <em>single point of failure.</em>
          </h1>

          <p>
            Create a protected Guardian copy of your Case
            Record so losing access to this device does not
            mean losing the record you built.
          </p>

          <div className="preserve-chain">
            <div>
              <span>01</span>
              <strong>Your Case Record</strong>
              <small>
                {incidentCount} preserved{" "}
                {incidentCount === 1
                  ? "incident"
                  : "incidents"}
              </small>
            </div>

            <i />

            <div>
              <span>02</span>
              <strong>Encrypted snapshot</strong>
              <small>Protected before storage</small>
            </div>

            <i />

            <div>
              <span>03</span>
              <strong>Recovery path</strong>
              <small>Guardian ID + recovery code</small>
            </div>
          </div>
        </aside>

        <section className="preserve-content">
          <AnimatePresence mode="wait">
            {!backup ? (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <div className="preserve-heading">
                  <span className="structure-eyebrow">
                    GUARDIAN VAULT
                  </span>

                  <h2>
                    Create a protected copy.
                  </h2>

                  <p>
                    Name a trusted Guardian for this backup.
                    ANTARA will create a recovery credential
                    for this protected snapshot.
                  </p>
                </div>

                <div className="guardian-form-card">
                  <div className="guardian-form-number">
                    01
                  </div>

                  <div className="guardian-form-content">
                    <label>
                      <span>Guardian name</span>

                      <small>
                        A trusted person you associate with
                        this protected copy.
                      </small>

                      <input
                        type="text"
                        value={guardianName}
                        onChange={(event) =>
                          setGuardianName(
                            event.target.value
                          )
                        }
                        placeholder="e.g. Meera"
                      />
                    </label>
                  </div>
                </div>

                <div className="guardian-form-card">
                  <div className="guardian-form-number">
                    02
                  </div>

                  <div className="guardian-form-content">
                    <label>
                      <span>
                        Contact reference{" "}
                        <em>optional</em>
                      </span>

                      <small>
                        Used as a reference for this Guardian
                        record. ANTARA does not automatically
                        send the backup to this contact.
                      </small>

                      <input
                        type="text"
                        value={guardianContact}
                        onChange={(event) =>
                          setGuardianContact(
                            event.target.value
                          )
                        }
                        placeholder="Phone or email"
                      />
                    </label>
                  </div>
                </div>

                <div className="guardian-explainer">
                  <span>◇</span>

                  <div>
                    <strong>
                      What happens when you protect it?
                    </strong>

                    <p>
                      ANTARA creates a snapshot of your
                      incident records, encrypts that
                      snapshot, and stores a protected
                      Guardian backup.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="preserve-error">
                    {error}
                  </div>
                )}

                <button
                  className="guardian-create-button"
                  disabled={
                    !guardianName.trim() || loading
                  }
                  onClick={createBackup}
                >
                  {loading
                    ? "Creating protected copy..."
                    : "Create Guardian Copy →"}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="guardian-success-heading">
                  <div className="guardian-success-icon">
                    ✓
                  </div>

                  <span className="structure-eyebrow">
                    PROTECTED COPY CREATED
                  </span>

                  <h2>
                    Your Case Record now has a
                    recovery path.
                  </h2>

                  <p>
                    Keep the information below somewhere
                    you can safely access if this device
                    becomes unavailable.
                  </p>
                </div>

                <div className="recovery-warning">
                  <span>!</span>

                  <div>
                    <strong>
                      This recovery code is shown once.
                    </strong>

                    <p>
                      ANTARA does not store the readable
                      recovery code. Save it somewhere safe
                      before continuing.
                    </p>
                  </div>
                </div>

                <div className="recovery-card">
                  <div className="recovery-card-label">
                    RECOVERY CODE
                  </div>

                  <div className="recovery-code">
                    {backup.recovery_code}
                  </div>

                  <button
                    onClick={copyRecoveryCode}
                    className="copy-recovery-button"
                  >
                    {copied
                      ? "Copied ✓"
                      : "Copy code"}
                  </button>
                </div>

                <div className="guardian-details">
                  <div>
                    <span>Guardian</span>
                    <strong>{guardianName}</strong>
                  </div>

                  <div>
                    <span>Guardian ID</span>
                    <strong>
                      {backup.guardian_id}
                    </strong>
                  </div>

                  <div>
                    <span>Protected</span>
                    <strong>
                      {new Date(
                        backup.backed_up_at
                      ).toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="preserve-note">
                  <span>◇</span>

                  <p>
                    Creating this copy does not contact a
                    Guardian, police, NGO, or any other
                    service automatically. You remain in
                    control of what happens next.
                  </p>
                </div>

                <div className="preserve-next">
                  <div>
                    <strong>
                      Case Record protected.
                    </strong>

                    <span>
                      Next, turn it into support-ready
                      documents.
                    </span>
                  </div>

                  <button
                    className="record-continue"
                    onClick={onContinue}
                  >
                    Continue to Prepare →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </motion.main>
  );
}