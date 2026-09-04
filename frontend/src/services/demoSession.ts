import { getToken } from "./api";
import { login, register } from "./authApi";

const DEMO_USERNAME = "anita_demo";
const DEMO_PASSWORD = "AntaraDemo@2908";
const DEMO_PIN = "2908";

export async function ensureDemoSession() {
  if (getToken()) {
    return;
  }

  try {
    await login({
      username: DEMO_USERNAME,
      password: DEMO_PASSWORD,
    });
  } catch {
    await register({
      username: DEMO_USERNAME,
      password: DEMO_PASSWORD,
      unlock_pin: DEMO_PIN,
    });
  }
}
