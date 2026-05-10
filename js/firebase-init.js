import { initializeApp }                              from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { initializeAppCheck, ReCaptchaV3Provider }   from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-check.js';
import firebaseConfig, { recaptchaSiteKey }           from './firebase-config.js';

try {
  const app = initializeApp(firebaseConfig);
  if (recaptchaSiteKey && recaptchaSiteKey !== 'REPLACE_WITH_YOUR_RECAPTCHA_SITE_KEY') {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true
    });
  }
  const db             = getFirestore(app);
  window._db           = db;
  window._fbCollection = collection;
  window._fbAddDoc     = addDoc;
  window._fbGetDocs    = getDocs;
} catch (e) {
  console.warn('Firebase unavailable — using localStorage fallback.', e);
}
