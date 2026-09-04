import { motion } from "framer-motion";
import { useRef, useState } from "react";

interface Props {
  onSecretUnlock: () => void;
}

const flowers = ["🌸", "🌼", "🌷", "🌺", "🌻", "🪻", "🌹", "🌸", "🌼"];

export default function PetalPop({ onSecretUnlock }: Props) {
  const [board, setBoard] = useState(flowers);
  const [score, setScore] = useState(1240);
  const [moves, setMoves] = useState(18);
  const [coins, setCoins] = useState(320);

  const timer = useRef<number | null>(null);
  const secretTriggered = useRef(false);

  const shuffle = () => {
    setBoard((current) => [...current].sort(() => Math.random() - 0.5));
    setScore((value) => value + Math.floor(Math.random() * 80) + 20);
    setCoins((value) => value + 3);
    setMoves((value) => Math.max(0, value - 1));
  };

  const startPress = () => {
    secretTriggered.current = false;

    timer.current = window.setTimeout(() => {
      secretTriggered.current = true;
      onSecretUnlock();
    }, 1800);
  };

  const endPress = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
    }

    if (!secretTriggered.current) {
      shuffle();
    }
  };

  return (
    <motion.main
      className="petal-game"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="game-header">
        <div>
          <p className="game-kicker">DAILY GARDEN</p>
          <h1>Petal Pop</h1>
        </div>

        <div className="coin-pill">🪙 {coins}</div>
      </header>

      <section className="game-card">
        <div className="game-stats">
          <div>
            <span>SCORE</span>
            <strong>{score}</strong>
          </div>

          <div>
            <span>MOVES</span>
            <strong>{moves}</strong>
          </div>
        </div>

        <div className="flower-board">
          {board.map((flower, index) => (
            <motion.button
              className="flower-tile"
              key={`${flower}-${index}`}
              layout
              whileTap={{ scale: 0.88 }}
              animate={{ scale: [0.96, 1] }}
              transition={{ duration: 0.2 }}
              onClick={shuffle}
            >
              {flower}
            </motion.button>
          ))}
        </div>

        <motion.button
          className="play-button"
          whileTap={{ scale: 0.96 }}
          onPointerDown={startPress}
          onPointerUp={endPress}
          onPointerLeave={() => {
            if (timer.current !== null) {
              window.clearTimeout(timer.current);
            }
          }}
        >
          PLAY MOVE
        </motion.button>

        <p className="game-tip">Match flowers and grow your garden.</p>
      </section>

      <nav className="game-nav">
        <button className="active">🌷<span>Play</span></button>
        <button>🎁<span>Rewards</span></button>
        <button>🌱<span>Collection</span></button>
        <button>☺<span>Profile</span></button>
      </nav>
    </motion.main>
  );
}
