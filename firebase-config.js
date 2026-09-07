/**
 * KASIIH STORE — FIREBASE CONFIGURATION
 * ----------------------------------------
 * This is what makes admin changes show up for EVERY visitor, not just
 * your own browser. It needs a free Firebase project — see README.md
 * for the full step-by-step (5 minutes, no credit card).
 *
 * Steps in short:
 *   1. console.firebase.google.com → Add project
 *   2. Build → Firestore Database → Create database (start in test mode,
 *      then paste the security rules from README.md)
 *   3. Build → Authentication → Get started → enable "Email/Password"
 *      → Users tab → Add user (this is your admin login)
 *   4. Project settings (gear icon) → scroll to "Your apps" → click the
 *      </> (web) icon → register app → copy the firebaseConfig object
 *      → paste it below, replacing the placeholder values.
 *
 * Until you paste real values here, the storefront still works — it
 * just falls back to the sample content in config.js, and the admin
 * panel will show a "Firebase not configured" message instead of a
 * login form.
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyB5HXG2RHnXOmje9YnfFO-jWxbw14BNi_M",
  authDomain: "saiki-store-85b4e.firebaseapp.com",
  projectId: "saiki-store-85b4e",
  storageBucket: "saiki-store-85b4e.firebasestorage.app",
  messagingSenderId: "608618400415",
  appId: "1:608618400415:web:18e377af3acf2aeb0370aa",
};

const FIREBASE_IS_CONFIGURED = FIREBASE_CONFIG.apiKey !== "AIzaSyB5HXG2RHnXOmje9YnfFO-jWxbw14BNi_M";

let db = null;
let auth = null;

if (FIREBASE_IS_CONFIGURED) {
  firebase.initializeApp(FIREBASE_CONFIG);
  db = firebase.firestore();
  auth = firebase.auth();
}
