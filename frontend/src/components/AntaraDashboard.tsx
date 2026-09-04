import { motion } from "framer-motion";

interface Props {
  onQuickExit: () => void;
  onRecord: () => void;
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
    text: "Protect your case and essential documents beyond one device.",
    icon: "◇",
  },
  {
    number: "04",
    title: "Prepare",
    text: "Create organised support-ready records when you need them.",
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
    text: "Choose exactly what you want to share and with whom.",
    icon: "→",
  },
];

export default function AntaraDashboard({
  onQuickExit,
  onRecord,
}: Props) {
  return (
    <motion.main
      className="antara-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="antara-header">
        <div className="antara-brand">
          <div className="antara-logo">A</div>

          <div>
            <span>ANTARA</span>
            <small>YOUR PRIVATE SPACE</small>
          </div>
        </div>

        <button className="quick-exit" onClick={onQuickExit}>
          Quick Exit
        </button>
      </header>

      <section className="dashboard-intro">
        <motion.p
          className="dashboard-kicker"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          YOU REMAIN IN CONTROL
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          Your story.
          <br />
          <em>Your choices.</em>
        </motion.h1>

        <motion.p
          className="dashboard-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.24 }}
        >
          ANTARA helps you record, organise and preserve important information
          privately — then decide what happens next.
        </motion.p>
      </section>

      <section className="journey">
        <div className="journey-heading">
          <p>YOUR JOURNEY</p>
          <span>Move at your own pace.</span>
        </div>

        <div className="journey-grid">
          {steps.map((step, index) => (
            <motion.button
              key={step.title}
              className={`journey-card ${index === 0 ? "journey-active" : ""}`}
              onClick={index === 0 ? onRecord : undefined}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 + index * 0.06 }}
              whileHover={index === 0 ? { y: -4 } : undefined}
            >
              <div className="journey-card-top">
                <span className="step-number">{step.number}</span>
                <span className="step-icon">{step.icon}</span>
              </div>

              <h2>{step.title}</h2>
              <p>{step.text}</p>

              {index === 0 && <span className="begin-link">Begin →</span>}
            </motion.button>
          ))}
        </div>
      </section>

      <footer className="dashboard-footer">
        <span>Private by design.</span>
        <span>Nothing is shared without your choice.</span>
      </footer>
    </motion.main>
  );
}