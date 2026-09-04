import { apiRequest } from "./api";

export interface SupportProvider {
  id: string;
  name: string;
  category: string;
  phone?: string | null;
  area?: string | null;
  city?: string | null;
  is_24x7: boolean;
  verified: boolean;
  notes?: string | null;
}

export async function getSupportRecommendations(
  city = "Delhi"
): Promise<SupportProvider[]> {
  return apiRequest<SupportProvider[]>(
    `/api/support/recommendations?city=${encodeURIComponent(city)}`
  );
}