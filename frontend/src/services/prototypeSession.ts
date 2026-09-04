import { apiRequest, getToken, setToken } from "./api";

interface AuthResponse {
  access_token: string;
}

const PROTOTYPE_USERNAME = "antara_prototype";
const PROTOTYPE_PASSWORD = "AntaraPrototype@2026";

export async function ensurePrototypeSession() {
  if (getToken()) {
    return;
  }

  try {
    const login = await apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: PROTOTYPE_USERNAME,
        password: PROTOTYPE_PASSWORD,
      }),
    });

    setToken(login.access_token);
    return;
  } catch {
    // Account probably does not exist yet.
  }

  try {
    await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username: PROTOTYPE_USERNAME,
        password: PROTOTYPE_PASSWORD,
      }),
    });
  } catch {
    // It may have been created between the login and register attempts.
  }

  const login = await apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      username: PROTOTYPE_USERNAME,
      password: PROTOTYPE_PASSWORD,
    }),
  });

  setToken(login.access_token);
}
