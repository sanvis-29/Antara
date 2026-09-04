import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import PetalPop from "./components/PetalPop";
import SecretUnlock from "./components/SecretUnlock";
import AntaraDashboard from "./components/AntaraDashboard";
import RecordIncident, {
  type IncidentFormData,
} from "./components/RecordIncident";
import "./App.css";

type Screen = "game" | "unlock" | "dashboard" | "record" | "structure";

function App() {
  const [screen, setScreen] = useState<Screen>("game");
  const [incidentDraft, setIncidentDraft] =
    useState<IncidentFormData | null>(null);

  const quickExit = () => {
    setScreen("game");
  };

  const handleIncident = (data: IncidentFormData) => {
    setIncidentDraft(data);
    setScreen("structure");
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
          onRecord={() => setScreen("record")}
        />
      )}

      {screen === "record" && (
        <RecordIncident
          key="record"
          onBack={() => setScreen("dashboard")}
          onQuickExit={quickExit}
          onContinue={handleIncident}
        />
      )}

      {screen === "structure" && (
        <div className="antara-placeholder" key="structure">
          <div>
            <p className="dashboard-kicker">RECORD SAVED LOCALLY</p>
            <h1>Ready to structure.</h1>

            <p>{incidentDraft?.description}</p>

            <button onClick={() => setScreen("record")}>Back</button>

            <button onClick={quickExit}>Quick Exit</button>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default App;