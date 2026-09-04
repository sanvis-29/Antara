import { motion } from "framer-motion";
import { useState } from "react";

interface Props {
  onUnlock: () => void;
  onCancel: () => void;
}

export default function SecretUnlock({ onUnlock, onCancel }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const submit = () => {
    if (pin === "2908") {
      setError(false);
      onUnlock();
      return;
    }

    setError(true);
    setPin("");
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
          onChange={(event) => {
            setPin(event.target.value);
            setError(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
        />

        {error && <span className="pin-error">That PIN wasn't recognised.</span>}

        <button className="unlock-button" onClick={submit}>
          Continue
        </button>

        <button className="cancel-button" onClick={onCancel}>
          Return
        </button>
      </motion.section>
    </motion.main>
  );
}
