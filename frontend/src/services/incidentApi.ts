import { apiRequest } from "./api";
import type { IncidentFormData } from "../components/RecordIncident";

export interface CreatedIncident {
  incident_id: string;
  user_id: string;
  description: string;
  date: string;
  time?: string | null;
  location?: string | null;

  people_involved?: Array<{
    role: string;
    name?: string | null;
  }>;

  categories?: {
    physical: boolean;
    economic: boolean;
    digital: boolean;
  };

  economic_details?: {
    money_controlled?: boolean | null;
    card_withheld?: boolean | null;
    amount?: string | null;
  };

  digital_details?: {
    platform?: string | null;
    private_content_threat?: boolean | null;
  };

  ai_classification?: unknown;

  [key: string]: unknown;
}

export function buildIncidentPayload(
  form: IncidentFormData
) {
  const physical =
    form.physical ||
    form.restrained ||
    form.physicalThreat ||
    form.medicalAttention;

  const economic =
    form.moneyControlled ||
    form.cardWithheld ||
    form.workRestricted ||
    form.moneyTaken ||
    form.forcedTransaction;

  const digital =
    form.digitalThreat ||
    form.deviceMonitored ||
    form.unauthorizedAccess ||
    form.digitalHarassment ||
    form.passwordControlled;

  return {
    description: form.description.trim(),

    date: form.date,

    time: form.time || null,

    location: form.location.trim() || null,

    people_involved: form.personRole.trim()
      ? [
          {
            role: form.personRole.trim(),
            name:
              form.personName.trim() || null,
          },
        ]
      : [],

    categories: {
      physical,
      economic,
      digital,
    },

    economic_details: {
      money_controlled:
        form.moneyControlled ||
        form.workRestricted ||
        form.moneyTaken ||
        form.forcedTransaction,

      card_withheld: form.cardWithheld,

      // Backend expects Optional[str], NOT number
      amount:
        form.amount.trim() || null,
    },

    digital_details: {
      platform:
        form.platform.trim() || null,

      private_content_threat:
        form.digitalThreat,
    },
  };
}

export async function createIncident(
  form: IncidentFormData
): Promise<CreatedIncident> {
  return apiRequest<CreatedIncident>(
    "/api/incidents",
    {
      method: "POST",
      body: JSON.stringify(
        buildIncidentPayload(form)
      ),
    }
  );
}