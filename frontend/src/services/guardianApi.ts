import { apiRequest } from "./api";

export interface GuardianBackupRequest {
  guardian_name: string;
  guardian_contact?: string | null;
}

export interface GuardianBackupResponse {
  guardian_id: string;
  recovery_code: string;
  backed_up_at: string;
  message: string;
}

export interface GuardianRecoveryResponse {
  user_id: string;
  backed_up_at: string;
  incidents: Array<Record<string, unknown>>;
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
  recoveryCode: string
): Promise<GuardianRecoveryResponse> {
  return apiRequest<GuardianRecoveryResponse>(
    "/api/guardian/recover",
    {
      method: "POST",
      body: JSON.stringify({
        guardian_id: guardianId,
        recovery_code: recoveryCode,
      }),
    }
  );
}