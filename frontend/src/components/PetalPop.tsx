import { motion } from "framer-motion";
import { useRef, useState } from "react";

interface Props {
  onSecretUnlock: () => void;
}

const FLOWERS = ["🌸", "🌼", "🌷", "🌺"];
const SIZE = 5;

function randomFlower() {
  return FLOWERS[Math.floor(Math.random() * FLOWERS.length)];
}

function createBoard() {
  /*
   * Slightly curated opening board so the demo always
   * begins with several obvious clickable clusters.
   */
  return [
    "🌸", "🌸", "🌼", "🌷", "🌷",
    "🌸", "🌼", "🌼", "🌷", "🌺",
    "🌺", "🌺", "🌼", "🌸", "🌸",
    "🌺", "🌷", "🌷", "🌸", "🌼",
    "🌼", "🌼", "🌷", "🌺", "🌺",
  ];
}

function getCluster(
  board: string[],
  startIndex: number
) {
  const target = board[startIndex];

  if (!target) return [];

  const visited = new Set<number>();
  const cluster: number[] = [];
  const queue = [startIndex];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (visited.has(current)) continue;

    visited.add(current);

    if (board[current] !== target) continue;

    cluster.push(current);

    const row = Math.floor(current / SIZE);
    const col = current % SIZE;

    const neighbours: number[] = [];

    if (row > 0) {
      neighbours.push(current - SIZE);
    }

    if (row < SIZE - 1) {
      neighbours.push(current + SIZE);
    }

    if (col > 0) {
      neighbours.push(current - 1);
    }

    if (col < SIZE - 1) {
      neighbours.push(current + 1);
    }

    neighbours.forEach((index) => {
      if (
        !visited.has(index) &&
        board[index] === target
      ) {
        queue.push(index);
      }
    });
  }

  return cluster;
}

function collapseBoard(
  board: string[],
  removed: number[]
) {
  const removedSet = new Set(removed);
  const result = Array(SIZE * SIZE).fill("");

  for (let col = 0; col < SIZE; col++) {
    const remaining: string[] = [];

    for (let row = SIZE - 1; row >= 0; row--) {
      const index = row * SIZE + col;

      if (!removedSet.has(index)) {
        remaining.push(board[index]);
      }
    }

    let remainingIndex = 0;

    for (let row = SIZE - 1; row >= 0; row--) {
      const index = row * SIZE + col;

      if (remainingIndex < remaining.length) {
        result[index] =
          remaining[remainingIndex++];
      } else {
        result[index] = randomFlower();
      }
    }
  }

  return result;
}

export default function PetalPop({
  onSecretUnlock,
}: Props) {
  const [board, setBoard] =
    useState<string[]>(createBoard);

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(860);
  const [moves, setMoves] = useState(12);

  const [message, setMessage] =
    useState("Click matching flowers to pop!");

  const [popping, setPopping] =
    useState<number[]>([]);

  const timer = useRef<number | null>(null);
  const secretTriggered = useRef(false);

  /*
   * Normal game interaction.
   */
  const popCluster = (index: number) => {
    if (popping.length > 0 || moves <= 0) {
      return;
    }

    const cluster = getCluster(board, index);

    if (cluster.length < 2) {
      setMessage("Find 2 or more matching flowers!");
      return;
    }

    setPopping(cluster);

    const earned =
      cluster.length * cluster.length * 10;

    const nextScore = score + earned;

    setScore(nextScore);
    setBest((current) =>
      Math.max(current, nextScore)
    );

    setMoves((current) =>
      Math.max(0, current - 1)
    );

    if (cluster.length >= 5) {
      setMessage(`Petal burst! +${earned}`);
    } else if (cluster.length >= 3) {
      setMessage(`Lovely! +${earned}`);
    } else {
      setMessage(`+${earned}`);
    }

    window.setTimeout(() => {
      setBoard((current) =>
        collapseBoard(current, cluster)
      );

      setPopping([]);
    }, 260);
  };

  /*
   * Covert ANTARA gesture.
   *
   * Holding the flower logo for 1.8 seconds
   * opens the private access layer.
   */
  const startSecretPress = () => {
    secretTriggered.current = false;

    timer.current = window.setTimeout(() => {
      secretTriggered.current = true;
      onSecretUnlock();
    }, 1800);
  };

  const cancelSecretPress = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const newGame = () => {
    setBoard(createBoard());
    setScore(0);
    setMoves(12);
    setMessage(
      "Click matching flowers to pop!"
    );
    setPopping([]);
  };

  return (
    <motion.main
      className="petal-game"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <header className="game-header">
        <div className="petal-title-row">
          <motion.button
            type="button"
            className="petal-secret-flower"
            aria-label="Petal Pop flower"
            onPointerDown={startSecretPress}
            onPointerUp={cancelSecretPress}
            onPointerLeave={cancelSecretPress}
            onContextMenu={(event) =>
              event.preventDefault()
            }
            whileTap={{ scale: 0.9 }}
          >
            🌸
          </motion.button>

          <div>
            <p className="game-kicker">
              DAILY GARDEN
            </p>

            <h1>Petal Pop</h1>
          </div>
        </div>

        <button
          type="button"
          className="game-new-button"
          onClick={newGame}
        >
          ↻ New Game
        </button>
      </header>

      <section className="game-card">
        <div className="game-stats">
          <div>
            <span>SCORE</span>
            <strong>{score}</strong>
          </div>

          <div>
            <span>BEST</span>
            <strong>{best}</strong>
          </div>

          <div>
            <span>MOVES</span>
            <strong>{moves}</strong>
          </div>
        </div>

        <div className="flower-board flower-board-large">
          {board.map((flower, index) => {
            const isPopping =
              popping.includes(index);

            return (
              <motion.button
                type="button"
                className={`flower-tile ${
                  isPopping
                    ? "flower-popping"
                    : ""
                }`}
                key={`${index}-${flower}`}
                layout
                onClick={() =>
                  popCluster(index)
                }
                whileHover={{
                  scale: 1.07,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                animate={
                  isPopping
                    ? {
                        scale: [1, 1.3, 0],
                        rotate: [0, 8, -8],
                        opacity: [1, 1, 0],
                      }
                    : {
                        scale: 1,
                        opacity: 1,
                      }
                }
                transition={{
                  duration: isPopping
                    ? 0.25
                    : 0.16,
                }}
              >
                {flower}
              </motion.button>
            );
          })}
        </div>

        <motion.div
          className="game-message"
          key={message}
          initial={{
            opacity: 0,
            y: 4,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          {message}
        </motion.div>

        <p className="game-tip">
          Pop groups of 2 or more matching flowers.
        </p>
      </section>

      <nav className="game-nav">
        <button className="active">
          🌷
          <span>Play</span>
        </button>

        <button>
          🎁
          <span>Rewards</span>
        </button>

        <button>
          🌱
          <span>Collection</span>
        </button>

        <button>
          ☺
          <span>Profile</span>
        </button>
      </nav>
    </motion.main>
  );
}