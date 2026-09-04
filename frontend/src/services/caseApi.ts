import { apiRequest } from "./api";

export interface AIClassification {
  tags: string[];
  confidence: number;
  method: string;
}

export interface StructuredIncident {
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
    money_controlled?: boolean;
    card_withheld?: boolean;
    amount?: number | null;
  };

  digital_details?: {
    platform?: string | null;
    private_content_threat?: boolean;
  };

  ai_classification?: AIClassification | null;

  [key: string]: unknown;
}

export interface CaseSummary {
  incident_count: number;
  evidence_count: number;
  categories_present: string[];
}

export interface CaseRecord {
  case_id: string;
  user_id: string;
  readiness_score: number;
  tags: string[];
  summary?: CaseSummary | null;
  generated_packs: Array<Record<string, unknown>>;
  incident_count: number;
  updated_at: string;
}

export async function structureIncident(
  incidentId: string
): Promise<StructuredIncident> {
  return apiRequest<StructuredIncident>("/api/case/structure", {
    method: "POST",
    body: JSON.stringify({
      incident_id: incidentId,
    }),
  });
}

export async function getCaseRecord(
  userId: string
): Promise<CaseRecord> {
  return apiRequest<CaseRecord>(`/api/case/${userId}`);
}