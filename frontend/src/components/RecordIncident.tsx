import { motion } from "framer-motion";
import { useState } from "react";

interface Props {
  onBack: () => void;
  onQuickExit: () => void;
  onContinue: (data: IncidentFormData) => void;
}

export interface IncidentFormData {
  description: string;
  date: string;
  time: string;
  location: string;
  personRole: string;
  personName: string;

  // Existing backend-compatible signals
  physical: boolean;
  moneyControlled: boolean;
  cardWithheld: boolean;
  digitalThreat: boolean;

  // Additional physical experiences
  restrained: boolean;
  physicalThreat: boolean;
  medicalAttention: boolean;

  // Additional financial experiences
  workRestricted: boolean;
  moneyTaken: boolean;
  forcedTransaction: boolean;

  // Additional digital experiences
  deviceMonitored: boolean;
  unauthorizedAccess: boolean;
  digitalHarassment: boolean;
  passwordControlled: boolean;

  amount: string;
  platform: string;
}

export default function RecordIncident({
  onBack,
  onQuickExit,
  onContinue,
}: Props) {
  const now = new Date();

  const [form, setForm] = useState<IncidentFormData>({
    description: "",
    date: now.toISOString().split("T")[0],
    time: now.toTimeString().slice(0, 5),
    location: "",
    personRole: "",
    personName: "",

    physical: false,
    moneyControlled: false,
    cardWithheld: false,
    digitalThreat: false,

    restrained: false,
    physicalThreat: false,
    medicalAttention: false,

    workRestricted: false,
    moneyTaken: false,
    forcedTransaction: false,

    deviceMonitored: false,
    unauthorizedAccess: false,
    digitalHarassment: false,
    passwordControlled: false,

    amount: "",
    platform: "",
  });

  const update = <K extends keyof IncidentFormData>(
    field: K,
    value: IncidentFormData[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const hasPhysicalExperience =
    form.physical ||
    form.restrained ||
    form.physicalThreat ||
    form.medicalAttention;

  const hasFinancialExperience =
    form.moneyControlled ||
    form.cardWithheld ||
    form.workRestricted ||
    form.moneyTaken ||
    form.forcedTransaction;

  const hasDigitalExperience =
    form.digitalThreat ||
    form.deviceMonitored ||
    form.unauthorizedAccess ||
    form.digitalHarassment ||
    form.passwordControlled;

  const hasExperience =
    hasPhysicalExperience ||
    hasFinancialExperience ||
    hasDigitalExperience;

  const canContinue =
    form.description.trim().length > 0 && hasExperience;

  return (
    <motion.main
      className="record-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="antara-header">
        <div className="antara-brand">
          <div className="antara-logo">A</div>

          <div>
            <span>ANTARA</span>
            <small>RECORD</small>
          </div>
        </div>

        <button className="quick-exit" onClick={onQuickExit}>
          Quick Exit
        </button>
      </header>

      <div className="record-layout">
        <aside className="record-intro">
          <button className="back-link" onClick={onBack}>
            ← Back
          </button>

          <p className="dashboard-kicker">01 — RECORD</p>

          <h1>
            Tell it in
            <br />
            <em>your words.</em>
          </h1>

          <p>
            You don't need legal terminology. Record what happened as simply
            or fully as you want.
          </p>

          <div className="record-privacy">
            <span>◇</span>

            <p>
              You decide what to record and what eventually leaves this
              private space.
            </p>
          </div>
        </aside>

        <section className="record-form">
          {/* WHAT HAPPENED */}

          <div className="form-section">
            <span className="form-step">WHAT HAPPENED?</span>

            <label className="field-label" htmlFor="description">
              Describe the experience in your own words
            </label>

            <textarea
              id="description"
              rows={6}
              value={form.description}
              placeholder="Start wherever feels easiest..."
              onChange={(event) =>
                update("description", event.target.value)
              }
            />

            <p className="field-help">
              You don't need to identify or name a type of abuse.
            </p>
          </div>

          {/* WHEN & WHERE */}

          <div className="form-section">
            <span className="form-step">WHEN & WHERE</span>

            <div className="form-grid">
              <label>
                <span>Date</span>

                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    update("date", event.target.value)
                  }
                />
              </label>

              <label>
                <span>Approximate time</span>

                <input
                  type="time"
                  value={form.time}
                  onChange={(event) =>
                    update("time", event.target.value)
                  }
                />
              </label>
            </div>

            <label>
              <span>Where did this happen?</span>

              <input
                value={form.location}
                placeholder="e.g. home"
                onChange={(event) =>
                  update("location", event.target.value)
                }
              />
            </label>
          </div>

          {/* WHO */}

          <div className="form-section">
            <span className="form-step">WHO WAS INVOLVED?</span>

            <div className="form-grid">
              <label>
                <span>Their relationship to you</span>

                <input
                  value={form.personRole}
                  placeholder="e.g. husband"
                  onChange={(event) =>
                    update("personRole", event.target.value)
                  }
                />
              </label>

              <label>
                <span>Name (optional)</span>

                <input
                  value={form.personName}
                  placeholder="You can leave this blank"
                  onChange={(event) =>
                    update("personName", event.target.value)
                  }
                />
              </label>
            </div>
          </div>

          {/* EXPERIENCES */}

          <div className="form-section">
            <span className="form-step">
              WHAT DID YOU EXPERIENCE?
            </span>

            <p className="section-copy">
              Select only what happened. You don't need to decide what
              category it belongs to — ANTARA will organise the details later.
            </p>

            <div className="experience-groups">
              {/* PHYSICAL */}

              <motion.div
                layout
                className={`experience-group ${
                  hasPhysicalExperience ? "group-active" : ""
                }`}
              >
                <div className="experience-group-heading">
                  <div className="experience-group-number">01</div>

                  <div>
                    <h3>Physical safety</h3>
                    <p>
                      Experiences involving physical harm, restraint or
                      threats to your physical safety.
                    </p>
                  </div>
                </div>

                <div className="experience-group-options">
                  <Experience
                    selected={form.physical}
                    onClick={() =>
                      update("physical", !form.physical)
                    }
                    title="I was physically hurt"
                    description="For example: hit, pushed, kicked, grabbed or otherwise injured."
                  />

                  <Experience
                    selected={form.restrained}
                    onClick={() =>
                      update("restrained", !form.restrained)
                    }
                    title="I was restrained or prevented from leaving"
                    description="For example: blocked at a door, held down, locked in or physically confined."
                  />

                  <Experience
                    selected={form.physicalThreat}
                    onClick={() =>
                      update("physicalThreat", !form.physicalThreat)
                    }
                    title="I was threatened with physical harm"
                    description="For example: someone threatened to hurt me or made me fear I would be hurt."
                  />

                  <Experience
                    selected={form.medicalAttention}
                    onClick={() =>
                      update(
                        "medicalAttention",
                        !form.medicalAttention
                      )
                    }
                    title="I needed or received medical attention"
                    description="For example: treatment, medication, examination or care after the incident."
                  />
                </div>
              </motion.div>

              {/* FINANCIAL */}

              <motion.div
                layout
                className={`experience-group ${
                  hasFinancialExperience ? "group-active" : ""
                }`}
              >
                <div className="experience-group-heading">
                  <div className="experience-group-number">02</div>

                  <div>
                    <h3>Money & financial access</h3>
                    <p>
                      Experiences involving your money, income, cards,
                      accounts or ability to make financial decisions.
                    </p>
                  </div>
                </div>

                <div className="experience-group-options">
                  <Experience
                    selected={form.moneyControlled}
                    onClick={() =>
                      update(
                        "moneyControlled",
                        !form.moneyControlled
                      )
                    }
                    title="Someone controlled my money or bank access"
                    description="For example: preventing access to earnings, accounts, savings or funds."
                  />

                  <Experience
                    selected={form.cardWithheld}
                    onClick={() =>
                      update(
                        "cardWithheld",
                        !form.cardWithheld
                      )
                    }
                    title="My card, cash or financial access was taken"
                    description="For example: a debit card, passbook, cash or account access was withheld."
                  />

                  <Experience
                    selected={form.workRestricted}
                    onClick={() =>
                      update(
                        "workRestricted",
                        !form.workRestricted
                      )
                    }
                    title="I was prevented from working or accessing my income"
                    description="For example: being stopped from going to work, earning independently or receiving wages."
                  />

                  <Experience
                    selected={form.moneyTaken}
                    onClick={() =>
                      update("moneyTaken", !form.moneyTaken)
                    }
                    title="My money was taken or used without my permission"
                    description="For example: cash, savings or earnings were taken or spent without my consent."
                  />

                  <Experience
                    selected={form.forcedTransaction}
                    onClick={() =>
                      update(
                        "forcedTransaction",
                        !form.forcedTransaction
                      )
                    }
                    title="I was pressured into a financial transaction"
                    description="For example: a transfer, payment, loan, withdrawal or other financial commitment."
                  />
                </div>

                {hasFinancialExperience && (
                  <motion.div
                    className="experience-extra"
                    initial={{
                      opacity: 0,
                      height: 0,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                    }}
                  >
                    <label>
                      <span>
                        Approximate amount involved (optional)
                      </span>

                      <input
                        value={form.amount}
                        placeholder="e.g. 5000"
                        onChange={(event) =>
                          update("amount", event.target.value)
                        }
                      />
                    </label>
                  </motion.div>
                )}
              </motion.div>

              {/* DIGITAL */}

              <motion.div
                layout
                className={`experience-group ${
                  hasDigitalExperience ? "group-active" : ""
                }`}
              >
                <div className="experience-group-heading">
                  <div className="experience-group-number">03</div>

                  <div>
                    <h3>Digital & private content</h3>
                    <p>
                      Experiences involving devices, accounts, messages,
                      monitoring or private content.
                    </p>
                  </div>
                </div>

                <div className="experience-group-options">
                  <Experience
                    selected={form.digitalThreat}
                    onClick={() =>
                      update(
                        "digitalThreat",
                        !form.digitalThreat
                      )
                    }
                    title="I was threatened using private content"
                    description="For example: threats to share private photos, videos, messages or other content."
                  />

                  <Experience
                    selected={form.deviceMonitored}
                    onClick={() =>
                      update(
                        "deviceMonitored",
                        !form.deviceMonitored
                      )
                    }
                    title="My phone, messages or online activity were monitored"
                    description="For example: someone repeatedly checked my phone, messages, calls or social accounts."
                  />

                  <Experience
                    selected={form.unauthorizedAccess}
                    onClick={() =>
                      update(
                        "unauthorizedAccess",
                        !form.unauthorizedAccess
                      )
                    }
                    title="Someone accessed my device or account without permission"
                    description="For example: opening my accounts, messages, email or device without my consent."
                  />

                  <Experience
                    selected={form.digitalHarassment}
                    onClick={() =>
                      update(
                        "digitalHarassment",
                        !form.digitalHarassment
                      )
                    }
                    title="I was threatened or repeatedly contacted digitally"
                    description="For example: threatening messages, repeated calls or unwanted online contact."
                  />

                  <Experience
                    selected={form.passwordControlled}
                    onClick={() =>
                      update(
                        "passwordControlled",
                        !form.passwordControlled
                      )
                    }
                    title="Someone controlled my passwords or account access"
                    description="For example: demanding passwords, changing them or preventing me from accessing an account."
                  />
                </div>

                {hasDigitalExperience && (
                  <motion.div
                    className="experience-extra"
                    initial={{
                      opacity: 0,
                      height: 0,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                    }}
                  >
                    <label>
                      <span>
                        Platform or service involved (optional)
                      </span>

                      <input
                        value={form.platform}
                        placeholder="e.g. WhatsApp, Instagram, Gmail"
                        onChange={(event) =>
                          update(
                            "platform",
                            event.target.value
                          )
                        }
                      />
                    </label>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>

          {/* CONTINUE */}

          <div className="record-actions">
            <div>
              <strong>Your story stays yours.</strong>
              <span>
                You can review it before continuing.
              </span>
            </div>

            <button
              className="record-continue"
              disabled={!canContinue}
              onClick={() => onContinue(form)}
            >
              Record & Continue →
            </button>
          </div>
        </section>
      </div>
    </motion.main>
  );
}

interface ExperienceProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
}

function Experience({
  selected,
  onClick,
  title,
  description,
}: ExperienceProps) {
  return (
    <button
      type="button"
      className={`experience-card ${
        selected ? "selected" : ""
      }`}
      onClick={onClick}
    >
      <span className="experience-check">
        {selected ? "✓" : ""}
      </span>

      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </button>
  );
}