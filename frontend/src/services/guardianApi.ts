import { apiRequest } from "./api";

export interface GuardianBackupRequest {
  guardian_name: string;
  guardian_contact?: string | null;
  unlock_pin: string;
}

export interface GuardianBackupResponse {
  guardian_id: string;
  backed_up_at: string;
  message: string;
}

export interface GuardianRecoveryResponse {
  user_id: string;
  backed_up_at: string;
  incidents: unknown[];
}

export async function createGuardianBackup(
  data: GuardianBackupRequest
): Promise<GuardianBackupResponse> {
  return apiRequest<GuardianBackupResponse>(
    "/api/guardian/backup",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function recoverGuardianBackup(
  guardianId: string,
  unlockPin: string
): Promise<GuardianRecoveryResponse> {
  return apiRequest<GuardianRecoveryResponse>(
    "/api/guardian/recover",
    {
      method: "POST",
      body: JSON.stringify({
        guardian_id: guardianId,
        unlock_pin: unlockPin,
      }),
    }
  );
}