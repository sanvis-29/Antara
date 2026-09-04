import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import PetalPop from "./components/PetalPop";
import SecretUnlock from "./components/SecretUnlock";
import "./App.css";

type Screen = "game" | "unlock" | "antara";

function App() {
  const [screen, setScreen] = useState<Screen>("game");

  return (
    <AnimatePresence mode="wait">
      {screen === "game" && (
        <PetalPop key="game" onSecretUnlock={() => setScreen("unlock")} />
      )}

      {screen === "unlock" && (
        <SecretUnlock
          key="unlock"
          onUnlock={() => setScreen("antara")}
          onCancel={() => setScreen("game")}
        />
      )}

      {screen === "antara" && (
        <div className="antara-placeholder" key="antara">
          <h1>ANTARA</h1>
          <p>Your private space.</p>

          <button onClick={() => setScreen("game")}>Quick Exit</button>
        </div>
      )}
    </AnimatePresence>
  );
}

export default App;