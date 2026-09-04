import { useState } from "react";
import { motion } from "framer-motion";

import {
  generateHandoff,
  type ConsentCategory,
  type HandoffBundle,
} from "../services/handoffApi";

interface Props {
  availableTags: string[];
  onBack: () => void;
  onQuickExit: () => void;
  onFinish: () => void;
}

const OPTIONS: Array<{
  category: ConsentCategory;
  number: string;
  title: string;
  description: string;
}> = [
  {
    category: "physical",
    number: "01",
    title: "Physical safety incidents",
    description:
      "Include recorded incidents involving physical harm or safety concerns.",
  },
  {
    category: "economic",
    number: "02",
    title: "Economic concerns",
    description:
      "Include incidents involving money, cards or financial access.",
  },
  {
    category: "digital",
    number: "03",
    title: "Digital concerns",
    description:
      "Include incidents involving digital threats or online safety concerns.",
  },
];

export default function HandoffCase({
  availableTags,
  onBack,
  onQuickExit,
  onFinish,
}: Props) {
  const [selected, setSelected] = useState<
    ConsentCategory[]
  >([]);

  const [includeEvidence, setIncludeEvidence] =
    useState(false);

  const [recipientNote, setRecipientNote] =
    useState("");

  const [bundle, setBundle] =
    useState<HandoffBundle | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  function toggleCategory(
    category: ConsentCategory
  ) {
    setSelected((current) =>
      current.includes(category)
        ? current.filter(
            (item) => item !== category
          )
        : [...current, category]
    );

    // Changing consent invalidates the previous bundle.
    setBundle(null);
  }

  async function handleGenerate() {
    if (selected.length === 0) {
      setError(
        "Choose at least one part of your Case Record."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await generateHandoff({
        consented_categories: selected,
        include_evidence: includeEvidence,
        recipient_note:
          recipientNote.trim() || null,
      });

      setBundle(result);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "ANTARA couldn't prepare this handoff."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.main
      className="handoff-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="antara-header">
        <div className="antara-brand">
          <div className="antara-logo">A</div>

          <div>
            <span>ANTARA</span>
            <small>HANDOFF</small>
          </div>
        </div>

        <button
          className="quick-exit"
          onClick={onQuickExit}
        >
          Quick Exit
        </button>
      </header>

      <div className="handoff-layout">
        <aside className="handoff-intro">
          <button
            className="back-link"
            onClick={onBack}
          >
            ← Back
          </button>

          <p className="dashboard-kicker">
            06 — HANDOFF
          </p>

          <h1>
            You decide
            <br />
            <em>what leaves.</em>
          </h1>

          <p>
            Seeking help should not mean surrendering
            everything you have stored.
          </p>

          <div className="handoff-principle">
            <span>◇</span>

            <div>
              <strong>
                Consent comes first.
              </strong>

              <p>
                Choose the parts of your Case Record you
                want included. Anything you leave
                unchecked stays outside this handoff.
              </p>
            </div>
          </div>
        </aside>

        <section className="handoff-content">
          {!bundle ? (
            <>
              <div className="handoff-heading">
                <span className="structure-eyebrow">
                  CHOOSE WHAT TO INCLUDE
                </span>

                <h2>
                  Build a consent-scoped handoff.
                </h2>

                <p>
                  Nothing is selected automatically.
                </p>
              </div>

              <div className="handoff-options">
                {OPTIONS.map((option) => {
                  const checked =
                    selected.includes(
                      option.category
                    );

                  const present =
                    availableTags.includes(
                      option.category
                    );

                  return (
                    <button
                      type="button"
                      key={option.category}
                      className={`handoff-option ${
                        checked
                          ? "handoff-option-selected"
                          : ""
                      }`}
                      onClick={() =>
                        toggleCategory(
                          option.category
                        )
                      }
                    >
                      <div className="handoff-option-number">
                        {option.number}
                      </div>

                      <div className="handoff-option-copy">
                        <div className="handoff-option-title">
                          <h3>
                            {option.title}
                          </h3>

                          {present && (
                            <span>
                              IN CASE RECORD
                            </span>
                          )}
                        </div>

                        <p>
                          {option.description}
                        </p>
                      </div>

                      <div
                        className={`handoff-check ${
                          checked
                            ? "handoff-check-active"
                            : ""
                        }`}
                      >
                        {checked ? "✓" : ""}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="handoff-evidence">
                <div>
                  <span>
                    ATTACHED EVIDENCE
                  </span>

                  <h3>
                    Include evidence references?
                  </h3>

                  <p>
                    Leave this off if you want the
                    handoff to contain the incident
                    record without its evidence.
                  </p>
                </div>

                <button
                  type="button"
                  className={`antara-switch ${
                    includeEvidence
                      ? "antara-switch-on"
                      : ""
                  }`}
                  onClick={() => {
                    setIncludeEvidence(
                      (current) => !current
                    );
                    setBundle(null);
                  }}
                  aria-label="Include evidence"
                >
                  <span />
                </button>
              </div>

              <div className="handoff-note">
                <label htmlFor="recipient-note">
                  OPTIONAL RECIPIENT NOTE
                </label>

                <textarea
                  id="recipient-note"
                  value={recipientNote}
                  onChange={(event) => {
                    setRecipientNote(
                      event.target.value
                    );
                    setBundle(null);
                  }}
                  placeholder="For example: For counselor review"
                  rows={3}
                />
              </div>

              <div className="handoff-selection-summary">
                <span>YOUR SELECTION</span>

                <strong>
                  {selected.length === 0
                    ? "Nothing selected yet"
                    : `${selected.length} ${
                        selected.length === 1
                          ? "category"
                          : "categories"
                      } selected`}
                </strong>

                <p>
                  Evidence:{" "}
                  {includeEvidence
                    ? "included"
                    : "not included"}
                </p>
              </div>

              {error && (
                <div className="prepare-error">
                  {error}
                </div>
              )}

              <div className="handoff-actions">
                <div>
                  <strong>
                    Review before anything goes
                    further.
                  </strong>

                  <span>
                    This creates a bundle. It does
                    not send it.
                  </span>
                </div>

                <button
                  className="record-continue"
                  disabled={
                    loading ||
                    selected.length === 0
                  }
                  onClick={handleGenerate}
                >
                  {loading
                    ? "Preparing..."
                    : "Prepare Handoff →"}
                </button>
              </div>
            </>
          ) : (
            <motion.div
              className="handoff-result"
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              <span className="structure-eyebrow">
                HANDOFF PREPARED
              </span>

              <h2>
                Only what you chose.
              </h2>

              <p className="handoff-result-intro">
                ANTARA has prepared a scoped copy of
                the Case Record based on your consent.
              </p>

              <div className="handoff-result-stats">
                <div>
                  <span>Categories shared</span>

                  <strong>
                    {
                      bundle
                        .consented_categories
                        .length
                    }
                  </strong>
                </div>

                <div>
                  <span>Incidents included</span>

                  <strong>
                    {bundle.incidents.length}
                  </strong>
                </div>

                <div>
                  <span>Evidence</span>

                  <strong>
                    {includeEvidence
                      ? "Included"
                      : "Excluded"}
                  </strong>
                </div>
              </div>

              <div className="handoff-consent-list">
                <span>CONSENTED INFORMATION</span>

                {bundle.consented_categories.map(
                  (category) => (
                    <div key={category}>
                      <span>✓</span>

                      <strong>
                        {category === "physical"
                          ? "Physical safety incidents"
                          : category === "economic"
                          ? "Economic concerns"
                          : "Digital concerns"}
                      </strong>
                    </div>
                  )
                )}
              </div>

              <div className="handoff-incidents">
                <span>INCLUDED INCIDENTS</span>

                {bundle.incidents.length === 0 ? (
                  <p>
                    No matching incidents were found
                    for the categories you selected.
                  </p>
                ) : (
                  bundle.incidents.map(
                    (incident, index) => (
                      <article
                        key={
                          incident.incident_id ??
                          index
                        }
                      >
                        <div>
                          <span>
                            INCIDENT{" "}
                            {String(
                              index + 1
                            ).padStart(2, "0")}
                          </span>

                          {incident.date && (
                            <small>
                              {incident.date}
                            </small>
                          )}
                        </div>

                        <blockquote>
                          “{incident.description}”
                        </blockquote>

                        <small>
                          Evidence included:{" "}
                          {incident.evidence
                            ?.length ?? 0}
                        </small>
                      </article>
                    )
                  )
                )}
              </div>

              {bundle.recipient_note && (
                <div className="handoff-result-note">
                  <span>RECIPIENT NOTE</span>

                  <p>
                    {bundle.recipient_note}
                  </p>
                </div>
              )}

              <div className="handoff-not-sent">
                <span>◇</span>

                <div>
                  <strong>
                    Nothing has been sent.
                  </strong>

                  <p>
                    The backend has generated this
                    consent-scoped bundle, but ANTARA
                    has not transmitted it to a
                    counselor, police service, legal
                    authority, NGO or any other
                    recipient.
                  </p>
                </div>
              </div>

              <div className="handoff-result-actions">
                <button
                  className="handoff-edit"
                  onClick={() =>
                    setBundle(null)
                  }
                >
                  ← Change selection
                </button>

                <button
                  className="record-continue"
                  onClick={onFinish}
                >
                  Finish →
                </button>
              </div>
            </motion.div>
          )}
        </section>
      </div>
    </motion.main>
  );
}