import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { apiRequest } from "../services/api";

interface Props {
  availableTags: string[];
  onBack: () => void;
  onQuickExit: () => void;
  onFinish: () => void;
}

type Category = "physical" | "economic" | "digital";

const categoryInfo: {
  id: Category;
  number: string;
  title: string;
  description: string;
}[] = [
  {
    id: "physical",
    number: "01",
    title: "Physical harm",
    description: "Incidents involving physical violence or threats of harm.",
  },
  {
    id: "economic",
    number: "02",
    title: "Economic control",
    description: "Money, bank access, cards, documents or financial control.",
  },
  {
    id: "digital",
    number: "03",
    title: "Digital coercion",
    description: "Device monitoring, account access or private-content threats.",
  },
];

export default function Handoff({
  onBack,
  onQuickExit,
  onFinish,
}: Props) {
  // Demo begins with Physical + Economic included,
  // while Digital remains private.
  const [selected, setSelected] = useState<Category[]>([
    "physical",
    "economic",
  ]);

  const [includeEvidence, setIncludeEvidence] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prepared, setPrepared] = useState(false);
  const [error, setError] = useState("");

  const toggleCategory = (category: Category) => {
    setSelected((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );

    setPrepared(false);
    setError("");
  };

  const toggleEvidence = () => {
    setIncludeEvidence((prev) => !prev);
    setPrepared(false);
    setError("");
  };

  const generateHandoff = async () => {
    if (selected.length === 0) {
      setError("Choose at least one category to prepare a handoff.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiRequest("/api/handoff/generate", {
        method: "POST",
        body: JSON.stringify({
          consented_categories: selected,
          include_evidence: includeEvidence,
          recipient_note: null,
        }),
      });

      setPrepared(true);
    } catch (err) {
      console.error("Handoff generation failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "The handoff could not be prepared right now. Nothing has been sent."
      );
    } finally {
      setLoading(false);
    }
  };

  const includedNames = categoryInfo
    .filter((item) => selected.includes(item.id))
    .map((item) => item.title);

  const privateNames = categoryInfo
    .filter((item) => !selected.includes(item.id))
    .map((item) => item.title);

  return (
    <motion.main
      className="handoff-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* TOP NAVIGATION */}
      <header className="handoff-nav">
        <button
          type="button"
          className="handoff-back-button"
          onClick={onBack}
        >
          <span>←</span>
          Back to case
        </button>

        <button
          type="button"
          className="handoff-quick-exit"
          onClick={onQuickExit}
        >
          Quick Exit
        </button>
      </header>

      <div className="handoff-container">
        {/* HERO */}
        <motion.section
          className="handoff-header"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="handoff-kicker">
            <span>06</span>
            <span className="handoff-kicker-line" />
            <span>HANDOFF</span>
          </div>

          <h1>
            You decide what
            <br />
            <em>leaves with you.</em>
          </h1>

          <p>
            Your Case Record stays private. You choose what you're ready
            to carry forward — and what remains with you.
          </p>
        </motion.section>

        <AnimatePresence mode="wait">
          {!prepared ? (
            <motion.div
              key="builder"
              className="handoff-layout"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              {/* LEFT — CHOICES */}
              <section className="handoff-builder">
                <div className="handoff-section-heading">
                  <div>
                    <span className="handoff-small-label">
                      BUILD YOUR HANDOFF
                    </span>

                    <h2>Choose what to include.</h2>
                  </div>

                  <div className="handoff-control-badge">
                    Survivor controlled
                  </div>
                </div>

                <div className="handoff-choice-list">
                  {categoryInfo.map((category) => {
                    const isSelected = selected.includes(category.id);

                    return (
                      <motion.button
                        key={category.id}
                        type="button"
                        className={`handoff-choice ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() => toggleCategory(category.id)}
                        whileTap={{ scale: 0.992 }}
                      >
                        <div className="handoff-choice-left">
                          <span className="handoff-choice-number">
                            {category.number}
                          </span>

                          <div className="handoff-choice-copy">
                            <h3>{category.title}</h3>
                            <p>{category.description}</p>
                          </div>
                        </div>

                        <div
                          className={`handoff-choice-status ${
                            isSelected ? "active" : ""
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <span className="handoff-tick">✓</span>
                              Included
                            </>
                          ) : (
                            "Keep private"
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* EVIDENCE */}
                <div className="handoff-evidence-section">
                  <span className="handoff-small-label">
                    SUPPORTING MATERIAL
                  </span>

                  <motion.button
                    type="button"
                    className={`handoff-evidence-card ${
                      includeEvidence ? "selected" : ""
                    }`}
                    onClick={toggleEvidence}
                    whileTap={{ scale: 0.992 }}
                  >
                    <div className="handoff-evidence-icon">◇</div>

                    <div className="handoff-evidence-copy">
                      <h3>Evidence attachments</h3>
                      <p>
                        Photos, files and supporting evidence linked to the
                        selected incident history.
                      </p>
                    </div>

                    <div
                      className={`handoff-evidence-state ${
                        includeEvidence ? "active" : ""
                      }`}
                    >
                      {includeEvidence ? "Included ✓" : "Not included"}
                    </div>
                  </motion.button>
                </div>

                {error && (
                  <motion.div
                    className="handoff-error"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.div>
                )}
              </section>

              {/* RIGHT — LIVE PREVIEW */}
              <aside className="handoff-preview">
                <div className="handoff-preview-top">
                  <span className="handoff-small-label">
                    HANDOFF PREVIEW
                  </span>

                  <span className="handoff-live-dot">
                    <i />
                    Live
                  </span>
                </div>

                <div className="handoff-preview-count">
                  <strong>{selected.length}</strong>

                  <span>
                    {selected.length === 1 ? "category" : "categories"}
                    <br />
                    selected
                  </span>
                </div>

                <div className="handoff-preview-rule" />

                <div className="handoff-preview-group">
                  <span>INCLUDED</span>

                  {includedNames.length > 0 ? (
                    includedNames.map((name) => (
                      <div
                        className="handoff-preview-item included"
                        key={name}
                      >
                        <span>✓</span>
                        {name}
                      </div>
                    ))
                  ) : (
                    <p className="handoff-none">Nothing selected yet.</p>
                  )}
                </div>

                <div className="handoff-preview-group">
                  <span>KEPT PRIVATE</span>

                  {privateNames.length > 0 ? (
                    privateNames.map((name) => (
                      <div
                        className="handoff-preview-item private"
                        key={name}
                      >
                        <span>—</span>
                        {name}
                      </div>
                    ))
                  ) : (
                    <p className="handoff-none">
                      All categories selected.
                    </p>
                  )}

                  {!includeEvidence && (
                    <div className="handoff-preview-item private">
                      <span>—</span>
                      Evidence attachments
                    </div>
                  )}
                </div>

                <div className="handoff-preview-rule" />

                <div className="handoff-preview-contents">
                  <span>THE BUNDLE WILL PREPARE</span>

                  <p>Case summary</p>
                  <p>Relevant incident history</p>
                  <p>Selected supporting information</p>
                </div>

                <motion.button
                  type="button"
                  className="handoff-generate-button"
                  onClick={generateHandoff}
                  disabled={loading || selected.length === 0}
                  whileHover={
                    !loading && selected.length > 0
                      ? { y: -2 }
                      : undefined
                  }
                  whileTap={
                    !loading && selected.length > 0
                      ? { scale: 0.98 }
                      : undefined
                  }
                >
                  {loading ? (
                    "Preparing…"
                  ) : (
                    <>
                      Generate handoff
                      <span>→</span>
                    </>
                  )}
                </motion.button>

                <p className="handoff-no-send">
                  Nothing is sent automatically.
                </p>
              </aside>
            </motion.div>
          ) : (
            /* SUCCESS STATE */
            <motion.section
              key="success"
              className="handoff-success"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="handoff-success-mark"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 180,
                  damping: 15,
                }}
              >
                ✓
              </motion.div>

              <span className="handoff-small-label">
                HANDOFF PREPARED
              </span>

              <h2>
                Your choices
                <br />
                <em>remain yours.</em>
              </h2>

              <p className="handoff-success-intro">
                A handoff has been prepared from the categories you chose
                to carry forward. Nothing has been transmitted automatically.
              </p>

              <div className="handoff-success-grid">
                <div className="handoff-success-column included">
                  <span>INCLUDED</span>

                  {includedNames.map((name) => (
                    <div key={name}>
                      <i>✓</i>
                      {name}
                    </div>
                  ))}

                  {includeEvidence && (
                    <div>
                      <i>✓</i>
                      Evidence attachments
                    </div>
                  )}
                </div>

                <div className="handoff-success-column private">
                  <span>KEPT PRIVATE</span>

                  {privateNames.length > 0 ? (
                    privateNames.map((name) => (
                      <div key={name}>
                        <i>—</i>
                        {name}
                      </div>
                    ))
                  ) : (
                    <div>
                      <i>—</i>
                      No categories withheld
                    </div>
                  )}

                  {!includeEvidence && (
                    <div>
                      <i>—</i>
                      Evidence attachments
                    </div>
                  )}
                </div>
              </div>

              <div className="handoff-success-message">
                <div>◇</div>

                <p>
                  <strong>Nothing has been sent.</strong>
                  This bundle is ready only when you choose to share it.
                </p>
              </div>

              <div className="handoff-success-actions">
                <button
                  type="button"
                  className="handoff-review-button"
                  onClick={() => {
                    setPrepared(false);
                    setError("");
                  }}
                >
                  ← Review choices
                </button>

                <button
                  type="button"
                  className="handoff-done-button"
                  onClick={onFinish}
                >
                  Back to Case Record
                  <span>→</span>
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </motion.main>
  );
}