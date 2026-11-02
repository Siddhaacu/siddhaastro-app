# Siddha Astro — Google Sign-In and Weekly User Reports

This implementation is on the `preview/auth-weekly-reports` branch. Production `main` is unchanged.

## What is implemented in code
- Firebase Web App configuration for the existing project `siddha-astro-bf578`.
- Google sign-in with persistent local sessions (`browserLocalPersistence`).
- Redirect-based sign-in on mobile browsers / installed PWAs and popup sign-in on desktop, with a redirect fallback if popups are blocked.
- Automatic user profile synchronization to Firestore `userReports/{uid}`.
- Profile fields: Firebase UID, display name, email, photo URL, sign-in provider, account creation time, last sign-in time and last app activity time.
- Weekly Excel report of **all user profiles stored in Firestore**, sent to `siddhagroupss@gmail.com` every Sunday at 08:00 India time (02:30 UTC).
- Privacy notice at `privacy.html`.
- Client Firestore rules restrict each signed-in user to their own profile. The scheduled function uses Firebase Admin SDK for the report.

## One-time deployment configuration still required
The code cannot safely create provider settings or deployment secrets inside Firebase/Netlify on the owner's behalf. Before preview testing, check the following:

1. Firebase Console → Authentication → Sign-in method: ensure Google is enabled.
2. Firebase Console → Authentication → Settings → Authorized domains: ensure `app.siddhaastro.in`, `siddhasankalpa.netlify.app`, and the exact Netlify Deploy Preview hostname are present.
3. Firebase Console → Firestore Database → Rules: publish the contents of `firestore.rules`.
4. In Netlify site settings, enable branch deploys / Deploy Previews for `preview/auth-weekly-reports`. Do not change the production branch.
5. Add these Netlify environment variables with Functions scope:
   - `FIREBASE_SERVICE_ACCOUNT_JSON`: complete Firebase Admin service-account JSON for project `siddha-astro-bf578` (secret).
   - `RESEND_API_KEY`: Resend API key (secret).
   - `REPORT_FROM_EMAIL`: sender address verified in Resend.
6. Verify the sender domain/address in Resend. The function will not send until this is configured.

## Schedule
Netlify scheduled function: `30 2 * * 0` UTC = Sunday 08:00 Asia/Kolkata. Scheduled functions execute in production context on Netlify; confirm that the production deployment has the matching function and secrets before enabling the schedule. For safe preview testing, invoke a preview-only manual test endpoint or test function before enabling production delivery. Do not send a real report from preview.

## Testing checklist
- Google login from desktop and iPhone / Android.
- Refresh and reopen the PWA; user should remain signed in.
- Sign out and sign back in.
- Verify one Firestore document is created per UID, with no duplicates.
- Update display name.
- Verify a user can read/write only their own profile.
- Generate a test XLSX with synthetic data and verify email delivery before enabling the scheduled report.

## Data handling
The report contains personal account information. The app displays a privacy notice describing the collection and weekly administrator report. Keep the spreadsheet confidential and delete it when no longer needed. Do not add passwords, OAuth tokens or Firebase service-account secrets to the report or repository.
