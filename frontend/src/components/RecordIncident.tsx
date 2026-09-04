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

  physical: boolean;
  moneyControlled: boolean;
  cardWithheld: boolean;
  digitalThreat: boolean;

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

  const canContinue =
    form.description.trim().length > 0 &&
    (form.physical ||
      form.moneyControlled ||
      form.cardWithheld ||
      form.digitalThreat);

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
              onChange={(event) => update("description", event.target.value)}
            />

            <p className="field-help">
              You don't need to identify or name a type of abuse.
            </p>
          </div>

          <div className="form-section">
            <span className="form-step">WHEN & WHERE</span>

            <div className="form-grid">
              <label>
                <span>Date</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => update("date", event.target.value)}
                />
              </label>

              <label>
                <span>Approximate time</span>
                <input
                  type="time"
                  value={form.time}
                  onChange={(event) => update("time", event.target.value)}
                />
              </label>
            </div>

            <label>
              <span>Where did this happen?</span>
              <input
                value={form.location}
                placeholder="e.g. home"
                onChange={(event) => update("location", event.target.value)}
              />
            </label>
          </div>

          <div className="form-section">
            <span className="form-step">WHO WAS INVOLVED?</span>

            <div className="form-grid">
              <label>
                <span>Their relationship to you</span>
                <input
                  value={form.personRole}
                  placeholder="e.g. husband"
                  onChange={(event) => update("personRole", event.target.value)}
                />
              </label>

              <label>
                <span>Name (optional)</span>
                <input
                  value={form.personName}
                  placeholder="You can leave this blank"
                  onChange={(event) => update("personName", event.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="form-section">
            <span className="form-step">WHAT DID YOU EXPERIENCE?</span>

            <p className="section-copy">
              Select only what happened. ANTARA will organise these details
              later.
            </p>

            <div className="experience-list">
              <Experience
                selected={form.physical}
                onClick={() => update("physical", !form.physical)}
                title="I was physically hurt or restrained"
                description="For example: hit, pushed, grabbed, restrained or injured."
              />

              <Experience
                selected={form.moneyControlled}
                onClick={() =>
                  update("moneyControlled", !form.moneyControlled)
                }
                title="Someone controlled my money or bank access"
                description="For example: preventing access to earnings, accounts or funds."
              />

              <Experience
                selected={form.cardWithheld}
                onClick={() => update("cardWithheld", !form.cardWithheld)}
                title="My card or financial access was taken from me"
                description="For example: a debit card, passbook or account access was withheld."
              />

              <Experience
                selected={form.digitalThreat}
                onClick={() => update("digitalThreat", !form.digitalThreat)}
                title="I was threatened through digital or private content"
                description="For example: threats involving messages, accounts, photos or videos."
              />
            </div>
          </div>

          {(form.moneyControlled || form.cardWithheld) && (
            <motion.div
              className="form-section contextual-section"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="form-step">FINANCIAL DETAILS</span>

              <label>
                <span>Amount involved (optional)</span>
                <input
                  value={form.amount}
                  placeholder="e.g. 5000"
                  onChange={(event) => update("amount", event.target.value)}
                />
              </label>
            </motion.div>
          )}

          {form.digitalThreat && (
            <motion.div
              className="form-section contextual-section"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="form-step">DIGITAL DETAILS</span>

              <label>
                <span>Platform or service (optional)</span>
                <input
                  value={form.platform}
                  placeholder="e.g. WhatsApp"
                  onChange={(event) => update("platform", event.target.value)}
                />
              </label>
            </motion.div>
          )}

          <div className="record-actions">
            <div>
              <strong>Your story stays yours.</strong>
              <span>You can review it before continuing.</span>
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
      className={`experience-card ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      <span className="experience-check">{selected ? "✓" : ""}</span>

      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </button>
  );
}
