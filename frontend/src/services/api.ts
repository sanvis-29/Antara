const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export function getToken() {
  return localStorage.getItem("antara_token");
}

export function setToken(token: string) {
  localStorage.setItem("antara_token", token);
}

export function clearToken() {
  localStorage.removeItem("antara_token");
  localStorage.removeItem("antara_user");
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Something went wrong.";

    try {
      const error = await response.json();
      message =
        typeof error.detail === "string"
          ? error.detail
          : "Please check the information and try again.";
    } catch {
      // use default message
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}