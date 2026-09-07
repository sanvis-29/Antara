import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  createGuardianBackup,
  type GuardianBackupResponse,
} from "../services/guardianApi";
import DocumentVault from "./DocumentVault";

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
  const [unlockPin, setUnlockPin] = useState("");

  const [backup, setBackup] =
    useState<GuardianBackupResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBackup = async () => {
    if (!guardianName.trim()) {
      setError("Choose a Guardian before creating the protected copy.");
      return;
    }

    if (!/^\d{4,8}$/.test(unlockPin)) {
      setError("Enter a private PIN containing 4 to 8 digits.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createGuardianBackup({
        guardian_name: guardianName.trim(),
        guardian_contact: guardianContact.trim() || null,
        unlock_pin: unlockPin,
      });

      setBackup(result);

      // Do not keep the PIN in component state after use.
      setUnlockPin("");
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
              <strong>Survivor-controlled access</strong>
              <small>Private PIN required</small>
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
                    Choose a trusted Guardian to preserve a
                    protected backup. Your Guardian does not
                    receive readable access to your Case Record.
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
                        Used only as a reference for this
                        Guardian record. ANTARA does not
                        automatically send your information
                        to this contact.
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

                <div className="guardian-form-card">
                  <div className="guardian-form-number">
                    03
                  </div>

                  <div className="guardian-form-content">
                    <label>
                      <span>Private PIN</span>

                      <small>
                        This PIN controls access to Guardian
                        Vault recovery. Your Guardian does not
                        receive or know this PIN.
                      </small>

                      <input
                        type="password"
                        inputMode="numeric"
                        autoComplete="off"
                        value={unlockPin}
                        onChange={(event) => {
                          const value =
                            event.target.value.replace(
                              /\D/g,
                              ""
                            );

                          setUnlockPin(
                            value.slice(0, 8)
                          );
                        }}
                        placeholder="4–8 digit PIN"
                        maxLength={8}
                      />
                    </label>
                  </div>
                </div>

                <div className="guardian-explainer">
                  <span>◇</span>

                  <div>
                    <strong>
                      The Guardian preserves it. You control
                      access.
                    </strong>

                    <p>
                      ANTARA creates an encrypted snapshot of
                      your Case Record. The Guardian provides
                      a recovery path if your primary device
                      becomes unavailable, but does not get
                      readable access to your information.
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
                    !guardianName.trim() ||
                    !/^\d{4,8}$/.test(unlockPin) ||
                    loading
                  }
                  onClick={createBackup}
                >
                  {loading
                    ? "Creating protected copy..."
                    : "Protect with Guardian →"}
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
                    GUARDIAN COPY PROTECTED
                  </span>

                  <h2>
                    Your Case Record now has a
                    protected recovery path.
                  </h2>

                  <p>
                    An encrypted Guardian copy has been
                    created. Your Guardian helps preserve it,
                    but does not receive readable access to
                    your Case Record.
                  </p>
                </div>

                <div className="guardian-explainer">
                  <span>◇</span>

                  <div>
                    <strong>
                      Guardian = preservation.
                      You = access.
                    </strong>

                    <p>
                      If your primary device becomes
                      unavailable, the protected copy can be
                      located through its Guardian ID.
                      Recovery still requires your private PIN.
                    </p>
                  </div>
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
                    <span>Access</span>
                    <strong>Private PIN protected</strong>
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

          <DocumentVault />
        </section>
      </div>
    </motion.main>
  );
}