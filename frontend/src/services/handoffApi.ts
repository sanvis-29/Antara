import { apiRequest } from "./api";

export type ConsentCategory =
  | "physical"
  | "economic"
  | "digital";

export interface HandoffIncident {
  incident_id: string;
  description: string;
  date?: string;
  time?: string | null;
  location?: string | null;

  categories?: {
    physical?: boolean;
    economic?: boolean;
    digital?: boolean;
  };

  evidence?: Array<{
    evidence_id?: string;
    type?: string;
    [key: string]: unknown;
  }>;

  [key: string]: unknown;
}

export interface HandoffBundle {
  user_id: string;
  generated_at: string;
  consented_categories: ConsentCategory[];
  recipient_note?: string | null;
  incidents: HandoffIncident[];
}

export interface HandoffInput {
  consented_categories: ConsentCategory[];
  include_evidence: boolean;
  recipient_note?: string | null;
}

export async function generateHandoff(
  input: HandoffInput
): Promise<HandoffBundle> {
  return apiRequest<HandoffBundle>(
    "/api/handoff/generate",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}