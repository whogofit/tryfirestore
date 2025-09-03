// enforces that this code can only be called on the server

// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment

import "server-only";

import { cookies } from "next/headers";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration object - replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyD3Y0oElbqPPJkFITFbp4lK7edJubr33hw",
  authDomain: "friendlyeats-codelab--friendlyeats-codelab-713cb.us-central1.hosted.app",
  projectId: "friendlyeats-codelab-713cb",
  // ... other config options
};

// Returns an authenticated client SDK instance for use in Server Side Rendering
// and Static Site Generation
export async function getAuthenticatedAppForUser() {
  const authIdToken = (await cookies()).get("__session")?.value;

  // Initialize the Firebase app
  const firebaseApp = initializeApp(firebaseConfig);

  // Initialize server-side Firebase app, if using initializeServerApp
  // Assuming initializeServerApp is a custom function for server SDK initialization
  const firebaseServerApp = initializeServerApp(firebaseApp, {
    authIdToken,
  });

  const auth = getAuth(firebaseServerApp);
  await auth.ensureAuthState();

  return { firebaseServerApp, currentUser: auth.currentUser };
}
