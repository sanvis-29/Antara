import { motion } from "framer-motion";
import { useState } from "react";
import { ensureDemoSession } from "../services/demoSession";

interface Props {
  onUnlock: () => void;
  onCancel: () => void;
}

export default function SecretUnlock({ onUnlock, onCancel }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (pin !== "2908") {
      setError("That PIN wasn't recognised.");
      setPin("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await ensureDemoSession();
      onUnlock();
    } catch (err) {
      console.error(err);

      setError(
        "ANTARA couldn't connect right now. Please check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.main
      className="unlock-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.section
        className="unlock-card"
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="unlock-symbol">✦</div>

        <p className="unlock-kicker">PRIVATE ACCESS</p>

        <h1>Welcome back.</h1>

        <p>Enter your private PIN to continue.</p>

        <input
          autoFocus
          type="password"
          inputMode="numeric"
          maxLength={8}
          placeholder="••••"
          value={pin}
          disabled={loading}
          onChange={(event) => {
            setPin(event.target.value);
            setError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !loading) {
              submit();
            }
          }}
        />

        {error && <span className="pin-error">{error}</span>}

        <button
          className="unlock-button"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Opening private space..." : "Continue"}
        </button>

        <button
          className="cancel-button"
          onClick={onCancel}
          disabled={loading}
        >
          Return
        </button>
      </motion.section>
    </motion.main>
  );
}
