import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import PetalPop from "./components/PetalPop";
import SecretUnlock from "./components/SecretUnlock";
import AntaraDashboard from "./components/AntaraDashboard";
import RecordIncident, {
  type IncidentFormData,
} from "./components/RecordIncident";
import StructureCase from "./components/StructureCase";

import {
  createIncident,
  type CreatedIncident,
} from "./services/incidentApi";

import {
  structureIncident,
  getCaseRecord,
  type StructuredIncident,
  type CaseRecord,
} from "./services/caseApi";

import "./App.css";

type Screen =
  | "game"
  | "unlock"
  | "dashboard"
  | "record"
  | "structure"
  | "preserve";

function App() {
  const [screen, setScreen] =
    useState<Screen>("game");

  const [incidentDraft, setIncidentDraft] =
    useState<IncidentFormData | null>(null);

  const [savedIncident, setSavedIncident] =
    useState<CreatedIncident | null>(null);

  const [structuredIncident, setStructuredIncident] =
    useState<StructuredIncident | null>(null);

  const [caseRecord, setCaseRecord] =
    useState<CaseRecord | null>(null);

  const [recordSaving, setRecordSaving] =
    useState(false);

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
      /*
       * STEP 1
       * Preserve the incident.
       */
      const incident = await createIncident(data);

      setSavedIncident(incident);

      const incidentId =
        incident.incident_id ??
        (typeof incident.id === "string"
          ? incident.id
          : undefined);

      if (!incidentId) {
        throw new Error(
          "The saved incident did not return an incident ID."
        );
      }

      /*
       * STEP 2
       * Structure it.
       */
      const structured =
        await structureIncident(incidentId);

      setStructuredIncident(structured);

      /*
       * STEP 3
       * Fetch the updated Case Record.
       */
      const userId =
        structured.user_id ??
        (typeof incident.user_id === "string"
          ? incident.user_id
          : undefined);

      if (!userId) {
        throw new Error(
          "ANTARA couldn't identify the current case record."
        );
      }

      const currentCase =
        await getCaseRecord(userId);

      setCaseRecord(currentCase);

      /*
       * Only enter 02 after all real backend
       * operations have succeeded.
       */
      setScreen("structure");
    } catch (error) {
      console.error(
        "Could not preserve or structure incident:",
        error
      );

      setRecordError(
        error instanceof Error
          ? error.message
          : "ANTARA couldn't organise this record right now."
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
          onSecretUnlock={() =>
            setScreen("unlock")
          }
        />
      )}

      {screen === "unlock" && (
        <SecretUnlock
          key="unlock"
          onUnlock={() =>
            setScreen("dashboard")
          }
          onCancel={() =>
            setScreen("game")
          }
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
            onBack={() =>
              setScreen("dashboard")
            }
            onQuickExit={quickExit}
            onContinue={handleIncident}
          />

          {recordSaving && (
            <div className="record-status-overlay">
              <div className="record-status-card">
                <span className="record-status-mark">
                  ◇
                </span>

                <strong>
                  Organising your record...
                </strong>

                <p>
                  ANTARA is preserving this experience
                  and updating your Case Record.
                </p>
              </div>
            </div>
          )}

          {recordError && (
            <div className="record-error-toast">
              <div>
                <strong>
                  We couldn't organise this yet.
                </strong>

                <span>{recordError}</span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setRecordError(null)
                }
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}

      {screen === "structure" &&
        structuredIncident &&
        caseRecord && (
          <StructureCase
            key="structure"
            incident={structuredIncident}
            caseRecord={caseRecord}
            onBack={() =>
              setScreen("record")
            }
            onQuickExit={quickExit}
            onContinue={() =>
              setScreen("preserve")
            }
          />
        )}

      {screen === "preserve" && (
        <div
          className="antara-placeholder"
          key="preserve"
        >
          <div>
            <p className="dashboard-kicker">
              03 — PRESERVE
            </p>

            <h1>Protect it beyond one device.</h1>

            <p>
              Your Case Record is ready for the
              Guardian Vault.
            </p>

            <button
              onClick={() =>
                setScreen("structure")
              }
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