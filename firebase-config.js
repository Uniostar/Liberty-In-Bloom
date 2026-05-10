// ============================================================
// Firebase Configuration — Liberty in Bloom
// ============================================================
// Firebase web API keys are public client-side identifiers — safe to commit.
// Security is enforced by App Check (reCAPTCHA) + Firestore security rules.
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyBbmqSlmrzg0zHv6zfLiUPLOGyHhuyuNhA",
  authDomain: "liberty-in-bloom.firebaseapp.com",
  projectId: "liberty-in-bloom",
  storageBucket: "liberty-in-bloom.firebasestorage.app",
  messagingSenderId: "1056635606247",
  appId: "1:1056635606247:web:3fd412e0b7ef0839117e42",
  measurementId: "G-VHYF3V9WZF"
};

export default firebaseConfig;

// ── reCAPTCHA v3 Site Key ────────────────────────────────────
// 1. Go to Firebase Console → App Check → Apps → Register your web app
// 2. Choose reCAPTCHA v3 as the provider — it gives you a site key
// 3. Paste that key below (replace the placeholder)
export const recaptchaSiteKey = '6LeKceMsAAAAAKPLg8ZYRRJLB3tFY0xvdkzrV0tG';
