import { getToken } from "./api";

import {
  getCurrentUser,
  login,
  logout,
  register,
} from "./authApi";

const DEMO_USERNAME = "anita_demo";
const DEMO_PASSWORD = "AntaraDemo@2908";
const DEMO_PIN = "2908";

export async function ensureDemoSession() {
  /*
   * A token in localStorage is not proof that the
   * backend still recognises the session.
   *
   * This matters especially during development when
   * the local database may have been reset.
   */
  if (getToken()) {
    try {
      await getCurrentUser();

      return;
    } catch {
      /*
       * Token is expired, malformed, or belongs to a
       * user that no longer exists.
       */
      logout();
    }
  }

  /*
   * No valid session exists.
   * First try the existing demo account.
   */
  try {
    await login({
      username: DEMO_USERNAME,
      password: DEMO_PASSWORD,
    });

    return;
  } catch {
    /*
     * Fresh development database:
     * the demo account probably doesn't exist yet.
     */
  }

  /*
   * Create the demo account.
   */
  await register({
    username: DEMO_USERNAME,
    password: DEMO_PASSWORD,
    unlock_pin: DEMO_PIN,
  });
}