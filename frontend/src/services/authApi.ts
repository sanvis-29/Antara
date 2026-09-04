import {
  apiRequest,
  clearToken,
  setToken,
} from "./api";

export interface AntaraUser {
  id: string;
  username: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AntaraUser;
}

interface RegisterInput {
  username: string;
  password: string;
  unlock_pin?: string;
}

interface LoginInput {
  username: string;
  password: string;
}

function saveSession(data: AuthResponse) {
  setToken(data.access_token);
  localStorage.setItem("antara_user", JSON.stringify(data.user));
}

export async function register(input: RegisterInput) {
  const data = await apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });

  saveSession(data);
  return data;
}

export async function login(input: LoginInput) {
  const data = await apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  saveSession(data);
  return data;
}

export function logout() {
  clearToken();
}

export function getStoredUser(): AntaraUser | null {
  const stored = localStorage.getItem("antara_user");

  if (!stored) return null;

  try {
    return JSON.parse(stored) as AntaraUser;
  } catch {
    return null;
  }
}
