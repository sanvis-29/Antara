import { apiRequest } from "./api";
import type { IncidentFormData } from "../components/RecordIncident";

export interface Incident {
  incident_id: string;
  user_id: string;
  description: string;
  date: string;
  time: string | null;
  location: string | null;

  people_involved: {
    role: string;
    name: string | null;
  }[];

  categories: {
    physical: boolean;
    economic: boolean;
    digital: boolean;
  };

  economic_details: {
    money_controlled: boolean | null;
    card_withheld: boolean | null;
    amount: string | number | null;
  };

  digital_details: {
    platform: string | null;
    private_content_threat: boolean | null;
  };

  evidence: unknown[];

  ai_classification: {
    tags: string[];
    confidence: number;
    method: string;
  } | null;

  created_at: string | null;
}

export function buildIncidentPayload(form: IncidentFormData) {
  return {
    description: form.description.trim(),
    date: form.date,
    time: form.time || null,
    location: form.location.trim() || null,

    people_involved: form.personRole.trim()
      ? [
          {
            role: form.personRole.trim(),
            name: form.personName.trim() || null,
          },
        ]
      : [],

    categories: {
      physical: form.physical,
      economic: form.moneyControlled || form.cardWithheld,
      digital: form.digitalThreat,
    },

    economic_details: {
      money_controlled: form.moneyControlled,
      card_withheld: form.cardWithheld,
      amount: form.amount.trim() || null,
    },

    digital_details: {
      platform: form.platform.trim() || null,
      private_content_threat: form.digitalThreat,
    },
  };
}

export async function createIncident(form: IncidentFormData) {
  return apiRequest<Incident>("/api/incidents", {
    method: "POST",
    body: JSON.stringify(buildIncidentPayload(form)),
  });
}
