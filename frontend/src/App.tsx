import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import PetalPop from "./components/PetalPop";
import SecretUnlock from "./components/SecretUnlock";
import AntaraDashboard from "./components/AntaraDashboard";
import RecordIncident, {
  type IncidentFormData,
} from "./components/RecordIncident";

import {
  createIncident,
  type CreatedIncident,
} from "./services/incidentApi";

import "./App.css";

type Screen =
  | "game"
  | "unlock"
  | "dashboard"
  | "record"
  | "structure";

function App() {
  const [screen, setScreen] = useState<Screen>("game");

  const [incidentDraft, setIncidentDraft] =
    useState<IncidentFormData | null>(null);

  const [savedIncident, setSavedIncident] =
    useState<CreatedIncident | null>(null);

  const [recordSaving, setRecordSaving] = useState(false);

  const [recordError, setRecordError] =
    useState<string | null>(null);

  const quickExit = () => {
    setScreen("game");
  };

  const handleIncident = async (
    data: IncidentFormData
  ) => {
    setIncidentDraft(data);
    setRecordSaving(true);
    setRecordError(null);

    try {
      const incident = await createIncident(data);

      setSavedIncident(incident);
      setScreen("structure");
    } catch (error) {
      console.error("Could not create incident:", error);

      setRecordError(
        error instanceof Error
          ? error.message
          : "ANTARA couldn't save this record right now."
      );
    } finally {
      setRecordSaving(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {screen === "game" && (
        <PetalPop
          key="game"
          onSecretUnlock={() => setScreen("unlock")}
        />
      )}

      {screen === "unlock" && (
        <SecretUnlock
          key="unlock"
          onUnlock={() => setScreen("dashboard")}
          onCancel={() => setScreen("game")}
        />
      )}

      {screen === "dashboard" && (
        <AntaraDashboard
          key="dashboard"
          onQuickExit={quickExit}
          onRecord={() => {
            setRecordError(null);
            setScreen("record");
          }}
        />
      )}

      {screen === "record" && (
        <div key="record">
          <RecordIncident
            onBack={() => setScreen("dashboard")}
            onQuickExit={quickExit}
            onContinue={handleIncident}
          />

          {recordSaving && (
            <div className="record-status-overlay">
              <div className="record-status-card">
                <span className="record-status-mark">◇</span>

                <strong>Preserving your record...</strong>

                <p>
                  ANTARA is securely adding this experience
                  to your case.
                </p>
              </div>
            </div>
          )}

          {recordError && (
            <div className="record-error-toast">
              <div>
                <strong>We couldn't save this yet.</strong>
                <span>{recordError}</span>
              </div>

              <button
                type="button"
                onClick={() => setRecordError(null)}
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}

      {screen === "structure" && (
        <div
          className="antara-placeholder"
          key="structure"
        >
          <div>
            <p className="dashboard-kicker">
              02 — STRUCTURE
            </p>

            <h1>Record preserved.</h1>

            <p>
              {savedIncident?.description ??
                incidentDraft?.description}
            </p>

            <p>
              ANTARA can now organise this experience into
              your Case Record.
            </p>

            <button
              onClick={() => setScreen("record")}
            >
              Back
            </button>

            <button onClick={quickExit}>
              Quick Exit
            </button>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default App;