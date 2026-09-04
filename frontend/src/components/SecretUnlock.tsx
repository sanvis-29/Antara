import { motion } from "framer-motion";
import { useState } from "react";
import { ensurePrototypeSession } from "../services/prototypeSession";

interface Props {
  onUnlock: () => void;
  onCancel: () => void;
}

export default function SecretUnlock({ onUnlock, onCancel }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (pin.length < 4) {
      setError("Enter your private PIN.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await ensurePrototypeSession();
      onUnlock();
    } catch (err) {
      console.error(err);
      setError(
        "ANTARA couldn't open the private space. Please check the connection."
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
            setPin(event.target.value.replace(/\D/g, ""));
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
          type="button"
          className="unlock-button"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Opening private space..." : "Continue"}
        </button>

        <button
          type="button"
          className="cancel-button"
          onClick={onCancel}
          disabled={loading}
        >
          Return
        </button>

        <p
          style={{
            marginTop: "18px",
            fontSize: "10px",
            opacity: 0.55,
          }}
        >
          Prototype access layer
        </p>
      </motion.section>
    </motion.main>
  );
}
