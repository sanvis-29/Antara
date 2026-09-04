import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import PetalPop from "./components/PetalPop";
import SecretUnlock from "./components/SecretUnlock";
import AntaraDashboard from "./components/AntaraDashboard";
import "./App.css";

type Screen = "game" | "unlock" | "dashboard" | "record";

function App() {
  const [screen, setScreen] = useState<Screen>("game");

  const quickExit = () => {
    setScreen("game");
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
        <div className="antara-placeholder" key="record">
          <h1>Record</h1>
          <p>Incident recording comes next.</p>

          <button onClick={() => setScreen("dashboard")}>
            Back
          </button>

          <button onClick={quickExit}>
            Quick Exit
          </button>
        </div>
      )}
    </AnimatePresence>
  );
}

export default App;