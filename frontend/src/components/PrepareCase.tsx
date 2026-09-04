import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  generatePack,
  type GeneratedPack,
  type PackType,
} from "../services/packApi";

interface Props {
  availableTags: string[];
  onBack: () => void;
  onQuickExit: () => void;
  onContinue: () => void;
}

interface PackDefinition {
  type: PackType;
  number: string;
  title: string;
  shortTitle: string;
  category: string;
  description: string;
  use: string;
}

const PACKS: PackDefinition[] = [
  {
    type: "dv_pack",
    number: "01",
    title: "Domestic Violence Pack",
    shortTitle: "DV Pack",
    category: "physical",
    description:
      "Organises incidents involving physical harm into one support-ready record.",
    use:
      "Useful when explaining a history of incidents to a counselor, legal-aid worker, or other support professional.",
  },
  {
    type: "economic_pack",
    number: "02",
    title: "Economic Abuse Record",
    shortTitle: "Economic",
    category: "economic",
    description:
      "Brings together incidents involving money, cards and financial access.",
    use:
      "Creates a clearer record of financial control that can accompany a request for support.",
  },
  {
    type: "cyber_pack",
    number: "03",
    title: "Cyber Report Pack",
    shortTitle: "Cyber",
    category: "digital",
    description:
      "Organises digital threats, private-content threats and platform information.",
    use:
      "Prepares the relevant digital record before approaching an appropriate cyber-support pathway.",
  },
];

export default function PrepareCase({
  availableTags,
  onBack,
  onQuickExit,
  onContinue,
}: Props) {
  const [generated, setGenerated] = useState<
    Partial<Record<PackType, GeneratedPack>>
  >({});

  const [selectedPack, setSelectedPack] =
    useState<PackType | null>(null);

  const [loadingPack, setLoadingPack] =
    useState<PackType | null>(null);

  const [error, setError] = useState<string | null>(
    null
  );

  const handleGenerate = async (type: PackType) => {
    setLoadingPack(type);
    setError(null);

    try {
      const result = await generatePack(type);

      setGenerated((current) => ({
        ...current,
        [type]: result,
      }));

      setSelectedPack(type);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "ANTARA couldn't prepare this record."
      );
    } finally {
      setLoadingPack(null);
    }
  };

  const selected =
    selectedPack !== null
      ? generated[selectedPack]
      : undefined;

  const selectedDefinition = PACKS.find(
    (pack) => pack.type === selectedPack
  );

  return (
    <motion.main
      className="prepare-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="antara-header">
        <div className="antara-brand">
          <div className="antara-logo">A</div>

          <div>
            <span>ANTARA</span>
            <small>PREPARE</small>
          </div>
        </div>

        <button
          className="quick-exit"
          onClick={onQuickExit}
        >
          Quick Exit
        </button>
      </header>

      <div className="prepare-layout">
        <aside className="prepare-intro">
          <button
            className="back-link"
            onClick={onBack}
          >
            ← Back
          </button>

          <p className="dashboard-kicker">
            04 — PREPARE
          </p>

          <h1>
            Don't reconstruct your story{" "}
            <em>every time.</em>
          </h1>

          <p>
            ANTARA can reuse the Case Record you already
            built and organise the relevant incidents for
            different support pathways.
          </p>

          <div className="prepare-principle">
            <span>◇</span>

            <div>
              <strong>
                Prepared, not submitted.
              </strong>

              <p>
                These are support-ready records generated
                inside ANTARA. They are not official
                government forms and are not automatically
                sent anywhere.
              </p>
            </div>
          </div>
        </aside>

        <section className="prepare-content">
          <div className="prepare-heading">
            <span className="structure-eyebrow">
              ONE CASE RECORD
            </span>

            <h2>Prepare what you need.</h2>

            <p>
              Each pack selects only the incidents relevant
              to that type of record.
            </p>
          </div>

          <div className="pack-grid">
            {PACKS.map((pack, index) => {
              const result = generated[pack.type];

              const relevant =
                availableTags.includes(pack.category);

              const isLoading =
                loadingPack === pack.type;

              return (
                <motion.article
                  className={`pack-card ${
                    result ? "pack-generated" : ""
                  }`}
                  key={pack.type}
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.07,
                  }}
                >
                  <div className="pack-card-top">
                    <span>{pack.number}</span>

                    {result && (
                      <small>PREPARED ✓</small>
                    )}
                  </div>

                  <h3>{pack.title}</h3>

                  <p>{pack.description}</p>

                  <div className="pack-use">
                    <span>WHY PREPARE THIS</span>
                    <p>{pack.use}</p>
                  </div>

                  {!relevant && (
                    <div className="pack-no-signal">
                      No matching pattern is currently
                      present in your Case Record. You can
                      still generate the pack; it may contain
                      zero incidents.
                    </div>
                  )}

                  {result ? (
                    <button
                      className="pack-view-button"
                      onClick={() =>
                        setSelectedPack(pack.type)
                      }
                    >
                      View prepared record →
                    </button>
                  ) : (
                    <button
                      className="pack-generate-button"
                      disabled={isLoading}
                      onClick={() =>
                        handleGenerate(pack.type)
                      }
                    >
                      {isLoading
                        ? "Preparing..."
                        : "Prepare record →"}
                    </button>
                  )}
                </motion.article>
              );
            })}
          </div>

          {error && (
            <div className="prepare-error">
              {error}
            </div>
          )}

          <AnimatePresence>
            {selected && selectedDefinition && (
              <motion.section
                className="pack-preview"
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                }}
              >
                <div className="pack-preview-header">
                  <div>
                    <span className="structure-eyebrow">
                      PREPARED RECORD
                    </span>

                    <h2>
                      {selectedDefinition.title}
                    </h2>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedPack(null)
                    }
                  >
                    ×
                  </button>
                </div>

                <div className="pack-preview-meta">
                  <div>
                    <span>Incidents included</span>
                    <strong>
                      {selected.incident_count}
                    </strong>
                  </div>

                  <div>
                    <span>Generated</span>
                    <strong>
                      {new Date(
                        selected.generated_at
                      ).toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span>Record type</span>
                    <strong>
                      {selectedDefinition.shortTitle}
                    </strong>
                  </div>
                </div>

                {selected.pack_type ===
                  "economic_pack" &&
                  selected.totals && (
                    <div className="pack-special-details">
                      <span>
                        FINANCIAL DETAILS IDENTIFIED
                      </span>

                      <div>
                        <p>
                          Card / financial access
                          withheld
                        </p>

                        <strong>
                          {selected.totals
                            .incidents_with_card_withheld ??
                            0}
                        </strong>
                      </div>

                      <div>
                        <p>
                          Incidents involving money
                          control
                        </p>

                        <strong>
                          {selected.totals
                            .incidents_with_money_controlled ??
                            0}
                        </strong>
                      </div>
                    </div>
                  )}

                {selected.pack_type ===
                  "cyber_pack" && (
                  <div className="pack-special-details">
                    <span>
                      PLATFORMS RECORDED
                    </span>

                    <p className="platform-list">
                      {selected.platforms_involved
                        ?.length
                        ? selected.platforms_involved.join(
                            ", "
                          )
                        : "No specific platform recorded."}
                    </p>
                  </div>
                )}

                <div className="pack-incidents">
                  <div className="pack-section-title">
                    INCLUDED INCIDENTS
                  </div>

                  {selected.incidents.length === 0 ? (
                    <p className="pack-empty">
                      No incidents in the current Case
                      Record match this pack.
                    </p>
                  ) : (
                    selected.incidents.map(
                      (incident, index) => (
                        <div
                          className="prepared-incident"
                          key={
                            incident.incident_id ??
                            index
                          }
                        >
                          <div className="prepared-incident-top">
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

                          <div className="prepared-incident-meta">
                            {incident.location && (
                              <span>
                                {incident.location}
                              </span>
                            )}

                            {incident.time && (
                              <span>
                                {incident.time}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>

                <div className="pack-disclaimer">
                  <span>◇</span>

                  <p>
                    This record organises information
                    already stored in ANTARA. It does not
                    determine whether an offence occurred
                    and has not been submitted to any
                    authority.
                  </p>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          <div className="prepare-next">
            <div>
              <strong>
                Your story can now travel in the form
                you choose.
              </strong>

              <span>
                Next, find the support pathway that fits
                your situation.
              </span>
            </div>

            <button
              className="record-continue"
              onClick={onContinue}
            >
              Continue to Navigate →
            </button>
          </div>
        </section>
      </div>
    </motion.main>
  );
}