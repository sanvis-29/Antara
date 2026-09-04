import { motion } from "framer-motion";

interface Props {
  hasCase: boolean;
  onQuickExit: () => void;
  onRecord: () => void;
  onStructure: () => void;
  onPreserve: () => void;
  onPrepare: () => void;
  onNavigate: () => void;
  onHandoff: () => void;
}

const steps = [
  {
    number: "01",
    title: "Record",
    text: "Capture what happened, in your own words.",
    icon: "✎",
  },
  {
    number: "02",
    title: "Structure",
    text: "Turn scattered details into one clear Case Record.",
    icon: "◫",
  },
  {
    number: "03",
    title: "Preserve",
    text: "Protect recovery copies and essential documents.",
    icon: "◇",
  },
  {
    number: "04",
    title: "Prepare",
    text: "Create support-ready records without submitting them.",
    icon: "≡",
  },
  {
    number: "05",
    title: "Navigate",
    text: "Understand relevant support pathways and why they may help.",
    icon: "⌖",
  },
  {
    number: "06",
    title: "Handoff",
    text: "Choose what you want to carry forward.",
    icon: "→",
  },
];

export default function AntaraDashboard({
  hasCase,
  onQuickExit,
  onRecord,
  onStructure,
  onPreserve,
  onPrepare,
  onNavigate,
  onHandoff,
}: Props) {
  const handlers = [
    onRecord,
    onStructure,
    onPreserve,
    onPrepare,
    onNavigate,
    onHandoff,
  ];

  return (
    <motion.main
      className="antara-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <header className="antara-header">
        <div className="antara-brand">
          <div className="antara-logo">A</div>

          <div>
            <span>ANTARA</span>
            <small>YOUR PRIVATE SPACE</small>
          </div>
        </div>

        <button
          type="button"
          className="quick-exit"
          onClick={onQuickExit}
        >
          Quick Exit
        </button>
      </header>

      <section className="dashboard-intro">
        <motion.p
          className="dashboard-kicker"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          YOU REMAIN IN CONTROL
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13 }}
        >
          Your story.
          <br />
          <em>Your choices.</em>
        </motion.h1>

        <motion.p
          className="dashboard-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.19 }}
        >
          Tell your story once. Organise and preserve it
          privately, then carry it wherever you choose to
          seek help.
        </motion.p>

        <motion.div
          className="case-continuity"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
        >
          <span className="case-continuity-mark">◇</span>

          <div>
            <strong>
              One story. One evolving Case Record.
            </strong>
            <span>
              Record · Structure · Preserve · Prepare ·
              Navigate · Handoff
            </span>
          </div>
        </motion.div>
      </section>

      <section className="journey">
        <div className="journey-heading">
          <p>YOUR JOURNEY</p>

          <span>
            {hasCase
              ? "Your Case Record is ready to continue."
              : "Begin wherever you feel ready."}
          </span>
        </div>

        <div className="journey-grid">
          {steps.map((step, index) => {
            const accessible = index === 0 || hasCase;

            return (
              <motion.button
                type="button"
                key={step.title}
                className={[
                  "journey-card",
                  accessible ? "journey-active" : "",
                  !accessible ? "journey-locked" : "",
                  hasCase && index <= 1
                    ? "journey-complete"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={
                  accessible
                    ? handlers[index]
                    : undefined
                }
                disabled={!accessible}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.26 + index * 0.045,
                }}
                whileHover={
                  accessible ? { y: -3 } : undefined
                }
              >
                <div className="journey-card-top">
                  <span className="step-number">
                    {step.number}
                  </span>

                  <span className="step-icon">
                    {step.icon}
                  </span>
                </div>

                <h2>{step.title}</h2>
                <p>{step.text}</p>

                <div className="journey-card-bottom">
                  {index === 0 && !hasCase && (
                    <span className="begin-link">
                      Begin →
                    </span>
                  )}

                  {index === 0 && hasCase && (
                    <span className="journey-status">
                      RECORDED ✓
                    </span>
                  )}

                  {index === 1 && hasCase && (
                    <span className="journey-status">
                      ORGANISED ✓
                    </span>
                  )}

                  {index > 1 && hasCase && (
                    <span className="begin-link">
                      Open →
                    </span>
                  )}

                  {!accessible && (
                    <span className="journey-waiting">
                      AFTER RECORD
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      <footer className="dashboard-footer">
        <span>Private by design.</span>
        <span>
          Nothing leaves ANTARA without your choice.
        </span>
      </footer>
    </motion.main>
  );
}