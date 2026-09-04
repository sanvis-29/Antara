import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  getSupportRecommendations,
  type SupportProvider,
} from "../services/supportApi";

interface Props {
  caseTags: string[];
  onBack: () => void;
  onQuickExit: () => void;
  onContinue: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  police: "Safety & Police",
  shelter: "Safe Housing",
  medical: "Medical Support",
  counseling: "Counselling",
  legal: "Legal Support",
  financial: "Financial Support",
  financial_aid: "Financial Support",
  cyber: "Cyber Support",
  cyber_crime_cell: "Cyber Support",
};

function getReason(
  category: string,
  tags: string[]
): string {
  switch (category) {
    case "police":
      return tags.includes("physical")
        ? "Shown because your Case Record includes a physical safety concern."
        : "Shown as a general safety pathway.";

    case "medical":
      return tags.includes("physical")
        ? "Shown because your Case Record includes an incident involving physical harm."
        : "Shown as a medical-support pathway.";

    case "shelter":
      return tags.includes("physical")
        ? "Shown because physical safety concerns may make access to safe housing relevant."
        : "Shown as a safe-housing pathway.";

    case "counseling":
      return tags.length > 0
        ? "Shown as an emotional and psychosocial support pathway alongside the concerns in your Case Record."
        : "Shown as a general support pathway.";

    case "legal":
      if (
        tags.includes("economic") &&
        tags.includes("digital")
      ) {
        return "Shown because your Case Record includes economic and digital concerns for which legal guidance may be relevant.";
      }

      if (tags.includes("economic")) {
        return "Shown because your Case Record includes concerns involving financial control.";
      }

      if (tags.includes("digital")) {
        return "Shown because your Case Record includes digital threats or online safety concerns.";
      }

      return "Shown as a legal-support pathway.";

    case "financial":
    case "financial_aid":
      return tags.includes("economic")
        ? "Shown because your Case Record includes concerns involving money or financial access."
        : "Shown as a financial-support pathway.";

    case "cyber":
    case "cyber_crime_cell":
      return tags.includes("digital")
        ? "Shown because your Case Record includes digital threats or online safety concerns."
        : "Shown as a cyber-support pathway.";

    default:
      return "Shown because this verified service matches a support need identified from your Case Record.";
  }
}

export default function NavigateSupport({
  caseTags,
  onBack,
  onQuickExit,
  onContinue,
}: Props) {
  const [providers, setProviders] = useState<
    SupportProvider[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  const [selected, setSelected] =
    useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const result =
          await getSupportRecommendations("Delhi");

        setProviders(result);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "ANTARA couldn't load support options."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <motion.main
      className="navigate-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="antara-header">
        <div className="antara-brand">
          <div className="antara-logo">A</div>

          <div>
            <span>ANTARA</span>
            <small>NAVIGATE</small>
          </div>
        </div>

        <button
          className="quick-exit"
          onClick={onQuickExit}
        >
          Quick Exit
        </button>
      </header>

      <div className="navigate-layout">
        <aside className="navigate-intro">
          <button
            className="back-link"
            onClick={onBack}
          >
            ← Back
          </button>

          <p className="dashboard-kicker">
            05 — NAVIGATE
          </p>

          <h1>
            Where do I
            <br />
            <em>actually go?</em>
          </h1>

          <p>
            ANTARA uses the patterns already organised
            in your Case Record to narrow down relevant
            support pathways.
          </p>

          <div className="navigate-case-signals">
            <span>FROM YOUR CASE RECORD</span>

            <div className="navigate-tags">
              {caseTags.length > 0 ? (
                caseTags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))
              ) : (
                <span>general support</span>
              )}
            </div>
          </div>

          <div className="navigate-privacy-note">
            <span>◇</span>

            <p>
              Viewing a recommendation does not contact
              the service or share your Case Record.
            </p>
          </div>
        </aside>

        <section className="navigate-content">
          <div className="navigate-heading">
            <span className="structure-eyebrow">
              SUPPORT PATHWAYS · DELHI
            </span>

            <h2>
              Options that match your situation.
            </h2>

            <p>
              You decide whether to contact or approach
              any service shown here.
            </p>
          </div>

          {loading && (
            <div className="navigate-loading">
              <div className="navigate-loader" />
              <p>
                Finding relevant support pathways…
              </p>
            </div>
          )}

          {error && (
            <div className="prepare-error">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            providers.length === 0 && (
              <div className="navigate-empty">
                <span>◇</span>
                <h3>
                  No matching verified services were
                  returned.
                </h3>
                <p>
                  Your Case Record remains unchanged.
                  ANTARA has not contacted anyone.
                </p>
              </div>
            )}

          {!loading &&
            providers.length > 0 && (
              <div className="support-list">
                {providers.map(
                  (provider, index) => {
                    const open =
                      selected === provider.id;

                    return (
                      <motion.article
                        className="support-card"
                        key={provider.id}
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: index * 0.05,
                        }}
                      >
                        <div className="support-card-number">
                          {String(
                            index + 1
                          ).padStart(2, "0")}
                        </div>

                        <div className="support-card-main">
                          <div className="support-card-top">
                            <div>
                              <div className="support-badges">
                                <span className="support-category">
                                  {CATEGORY_LABELS[
                                    provider.category
                                  ] ??
                                    provider.category}
                                </span>

                                {provider.verified && (
                                  <span className="verified-badge">
                                    VERIFIED
                                  </span>
                                )}

                                {provider.is_24x7 && (
                                  <span className="always-badge">
                                    24 × 7
                                  </span>
                                )}
                              </div>

                              <h3>
                                {provider.name}
                              </h3>

                              {(provider.area ||
                                provider.city) && (
                                <p className="support-location">
                                  {[
                                    provider.area,
                                    provider.city,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                </p>
                              )}
                            </div>

                            {provider.phone && (
                              <div className="support-phone">
                                <span>
                                  CONTACT
                                </span>

                                <strong>
                                  {provider.phone}
                                </strong>
                              </div>
                            )}
                          </div>

                          {provider.notes && (
                            <p className="support-notes">
                              {provider.notes}
                            </p>
                          )}

                          <button
                            className="why-button"
                            onClick={() =>
                              setSelected(
                                open
                                  ? null
                                  : provider.id
                              )
                            }
                          >
                            Why ANTARA showed this
                            <span>
                              {open ? "−" : "+"}
                            </span>
                          </button>

                          {open && (
                            <motion.div
                              className="support-reason"
                              initial={{
                                opacity: 0,
                                height: 0,
                              }}
                              animate={{
                                opacity: 1,
                                height: "auto",
                              }}
                            >
                              <span>WHY THIS OPTION</span>

                              <p>
                                {getReason(
                                  provider.category,
                                  caseTags
                                )}
                              </p>

                              <small>
                                This is a
                                rule-based recommendation,
                                not a legal or safety
                                assessment.
                              </small>
                            </motion.div>
                          )}
                        </div>
                      </motion.article>
                    );
                  }
                )}
              </div>
            )}

          <div className="navigate-boundary">
            <div className="navigate-boundary-icon">
              ◇
            </div>

            <div>
              <strong>
                Nothing has been sent.
              </strong>

              <p>
                ANTARA is helping you understand your
                options. No provider, police service,
                counselor or authority has been contacted
                by viewing this page.
              </p>
            </div>
          </div>

          <div className="navigate-next">
            <div>
              <span>06 — HANDOFF</span>

              <strong>
                If you choose to seek help, you still
                decide what leaves ANTARA.
              </strong>
            </div>

            <button
              className="record-continue"
              onClick={onContinue}
            >
              Continue to Handoff →
            </button>
          </div>
        </section>
      </div>
    </motion.main>
  );
}