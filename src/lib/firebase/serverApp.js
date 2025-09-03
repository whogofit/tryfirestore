// enforces that this code can only be called on the server
import "server-only";

import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { getApp, initializeApp, cert } from "firebase-admin/app";
import { config } from "@/lib/firebase/config.server";

// A function to initialize the Firebase Admin SDK once.
// This prevents multiple initializations which can cause errors.
function initializeFirebaseAdmin() {
  try {
    return getApp();
  } catch (error) {
    return initializeApp({
      credential: cert(config.serviceAccount),
      projectId: config.projectId,
    });
  }
}

const firebaseAdminApp = initializeFirebaseAdmin();
const adminAuth = getAuth(firebaseAdminApp);

/**
 * Verifies the user's session cookie and returns the authenticated user object.
 * This is the correct way to handle server-side authentication with Firebase.
 * @returns {Promise<{ currentUser: import('firebase-admin/auth').DecodedIdToken | null }>}
 */
export async function getAuthenticatedUser() {
  try {
    const sessionCookie = cookies().get("__session")?.value;

    if (!sessionCookie) {
      return { currentUser: null };
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return { currentUser: decodedClaims };
  } catch (error) {
    console.error("Error verifying session cookie:", error);
    // Token is invalid, remove cookie to force re-authentication
    cookies().delete("__session");
    return { currentUser: null };
  }
}