# Siddha Astro Google Sign-In setup

The profile UI and Firebase Authentication client are implemented, but Google sign-in requires a Firebase project and Netlify public web configuration.

## Firebase project
1. Open https://console.firebase.google.com/ and select the Siddha Astro project, or create one if none exists.
2. Add a Web app in Project settings → General.
3. In Authentication → Sign-in method, enable Google and choose a support email.
4. In Authentication → Settings → Authorized domains, add app.siddhaastro.in and siddhasankalpa.netlify.app. Add the exact Deploy Preview domain when testing previews.
5. Enable Cloud Firestore and publish this repository's firestore.rules.

## Netlify environment variables
In Netlify → siddhasankalpa → Project configuration → Environment variables, set for Production and Deploy Previews:

- FIREBASE_API_KEY — Firebase Web App apiKey
- FIREBASE_AUTH_DOMAIN — Firebase Web App authDomain (usually PROJECT_ID.firebaseapp.com)
- FIREBASE_PROJECT_ID — Firebase projectId
- FIREBASE_APP_ID — Firebase Web App appId
- FIREBASE_MESSAGING_SENDER_ID — optional

The client obtains these public Firebase Web App values from the same-origin /.netlify/functions/firebase-config endpoint. Firebase Web config is public; never put Admin SDK service-account JSON or private keys in browser code.

## Verification
1. Trigger a fresh Deploy Preview after setting preview environment variables.
2. Test Google sign-in, profile update, sign-out, and account deletion with a test account.
3. Verify Firestore writes only occur after the user checks the weekly report consent box.
4. Set Production values and publish a production deploy, then repeat tests at https://app.siddhaastro.in.

The separate weekly email report requires server-only FIREBASE_SERVICE_ACCOUNT_JSON, RESEND_API_KEY, and REPORT_FROM_EMAIL. Do not enable it until the privacy notice, consent withdrawal, retention, and access controls are reviewed.
