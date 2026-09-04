import { motion } from "framer-motion";
import type {
  CaseRecord,
  StructuredIncident,
} from "../services/caseApi";

interface Props {
  incident: StructuredIncident;
  caseRecord: CaseRecord;
  onBack: () => void;
  onQuickExit: () => void;
  onContinue: () => void;
}

const LABELS: Record<string, string> = {
  physical: "Physical safety",
  economic: "Financial control",
  digital: "Digital coercion",
};

export default function StructureCase({
  incident,
  caseRecord,
  onBack,
  onQuickExit,
  onContinue,
}: Props) {
  const tags =
    incident.ai_classification?.tags?.length
      ? incident.ai_classification.tags
      : caseRecord.tags ?? [];

  const score = Math.round(caseRecord.readiness_score ?? 0);

  const incidentCount =
    caseRecord.summary?.incident_count ??
    caseRecord.incident_count ??
    0;

  const evidenceCount =
    caseRecord.summary?.evidence_count ?? 0;

  return (
    <motion.main
      className="structure-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="antara-header">
        <div className="antara-brand">
          <div className="antara-logo">A</div>

          <div>
            <span>ANTARA</span>
            <small>STRUCTURE</small>
          </div>
        </div>

        <button
          className="quick-exit"
          onClick={onQuickExit}
        >
          Quick Exit
        </button>
      </header>

      <div className="structure-layout">
        {/* LEFT */}

        <aside className="structure-intro">
          <button
            className="back-link"
            onClick={onBack}
          >
            ← Back
          </button>

          <p className="dashboard-kicker">
            02 — STRUCTURE
          </p>

          <h1>
            From one story
            <br />
            to a <em>case record.</em>
          </h1>

          <p>
            ANTARA organises what you recorded into a
            consistent structure that can be carried
            forward.
          </p>

          <div className="structure-principle">
            <span>◇</span>

            <div>
              <strong>
                This isn't a legal diagnosis.
              </strong>

              <p>
                It's organisation — your experience
                remains in your words.
              </p>
            </div>
          </div>
        </aside>

        {/* RIGHT */}

        <section className="structure-content">
          <motion.div
            className="structure-success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="structure-success-mark">
              ✓
            </span>

            <div>
              <span className="structure-eyebrow">
                CASE RECORD UPDATED
              </span>

              <h2>Your story has been organised.</h2>

              <p>
                ANTARA found the experiences you recorded
                and connected them to one structured case
                record.
              </p>
            </div>
          </motion.div>

          {/* STORY */}

          <motion.div
            className="structure-panel story-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <div className="structure-panel-heading">
              <span>YOUR RECORD</span>

              <small>
                Incident {incident.incident_id}
              </small>
            </div>

            <blockquote>
              “{incident.description}”
            </blockquote>

            <div className="story-meta">
              {incident.date && (
                <span>{incident.date}</span>
              )}

              {incident.time && (
                <span>{incident.time}</span>
              )}

              {incident.location && (
                <span>{incident.location}</span>
              )}
            </div>
          </motion.div>

          {/* DETECTED PATTERNS */}

          <motion.div
            className="structure-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
          >
            <div className="structure-panel-heading">
              <span>ORGANISED PATTERNS</span>

              <small>
                Based on what you recorded
              </small>
            </div>

            {tags.length > 0 ? (
              <div className="structure-tags">
                {tags.map((tag, index) => (
                  <motion.div
                    className="structure-tag"
                    key={tag}
                    initial={{
                      opacity: 0,
                      scale: 0.96,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      delay: 0.18 + index * 0.06,
                    }}
                  >
                    <span className="structure-tag-number">
                      0{index + 1}
                    </span>

                    <div>
                      <strong>
                        {LABELS[tag] ?? tag}
                      </strong>

                      <p>
                        This pattern was included because
                        of experiences you selected or
                        recorded.
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="structure-muted">
                No patterns have been organised yet.
              </p>
            )}
          </motion.div>

          {/* CASE READINESS */}

          <motion.div
            className="readiness-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="readiness-main">
              <div>
                <span className="structure-eyebrow">
                  CASE READINESS
                </span>

                <h2>
                  Your record is{" "}
                  <em>taking shape.</em>
                </h2>

                <p>
                  This score reflects how much structured
                  incident and supporting information is
                  currently preserved in ANTARA.
                </p>
              </div>

              <div className="readiness-score">
                <strong>{score}</strong>
                <span>/ 100</span>
              </div>
            </div>

            <div className="readiness-track">
              <motion.div
                className="readiness-fill"
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(score, 100)}%`,
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.35,
                }}
              />
            </div>

            <div className="readiness-stats">
              <div>
                <strong>{incidentCount}</strong>
                <span>
                  {incidentCount === 1
                    ? "Incident"
                    : "Incidents"}
                </span>
              </div>

              <div>
                <strong>{evidenceCount}</strong>
                <span>Evidence items</span>
              </div>

              <div>
                <strong>{caseRecord.tags.length}</strong>
                <span>Patterns present</span>
              </div>
            </div>

            <p className="readiness-note">
              The readiness score is an organisational
              indicator inside ANTARA. It is not a legal
              assessment or prediction of an outcome.
            </p>
          </motion.div>

          {/* FLOW */}

          <motion.div
            className="structure-flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="structure-flow-item done">
              <span>01</span>
              <strong>Record</strong>
              <small>Complete</small>
            </div>

            <div className="structure-flow-line" />

            <div className="structure-flow-item active">
              <span>02</span>
              <strong>Structure</strong>
              <small>Complete</small>
            </div>

            <div className="structure-flow-line" />

            <div className="structure-flow-item">
              <span>03</span>
              <strong>Preserve</strong>
              <small>Next</small>
            </div>
          </motion.div>

          <div className="structure-actions">
            <div>
              <strong>
                One story. One evolving Case Record.
              </strong>

              <span>
                Next, protect it beyond this device.
              </span>
            </div>

            <button
              className="record-continue"
              onClick={onContinue}
            >
              Continue to Preserve →
            </button>
          </div>
        </section>
      </div>
    </motion.main>
  );
}