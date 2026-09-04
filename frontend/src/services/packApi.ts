import { apiRequest } from "./api";

export type PackType =
  | "dv_pack"
  | "economic_pack"
  | "cyber_pack";

export interface PackIncident {
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

  people_involved?: Array<{
    role?: string;
    name?: string | null;
  }>;

  economic_details?: {
    money_controlled?: boolean;
    card_withheld?: boolean;
    amount?: number | null;
  };

  digital_details?: {
    platform?: string | null;
    private_content_threat?: boolean;
  };

  evidence?: Array<Record<string, unknown>>;

  [key: string]: unknown;
}

export interface GeneratedPack {
  pack_type: PackType;
  user_id: string;
  generated_at: string;
  incident_count: number;
  incidents: PackIncident[];

  totals?: {
    incidents_with_card_withheld?: number;
    incidents_with_money_controlled?: number;
  };

  platforms_involved?: string[];
}

export async function generatePack(
  packType: PackType
): Promise<GeneratedPack> {
  return apiRequest<GeneratedPack>(
    "/api/packs/generate",
    {
      method: "POST",
      body: JSON.stringify({
        pack_type: packType,
      }),
    }
  );
}