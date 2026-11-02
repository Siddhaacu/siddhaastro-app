# Siddha Astro — Google Sign-In and Weekly User Reports

This implementation is on the `preview/auth-weekly-reports` branch. Production `main` is unchanged.

## Implemented in code
- Firebase Web App configuration for the existing project `siddha-astro-bf578`.
- Google sign-in with persistent local sessions (`browserLocalPersistence`).
- Redirect-based sign-in on mobile browsers / installed PWAs and popup sign-in on desktop, with a redirect fallback if popups are blocked.
- Automatic profile synchronization to Firestore `userReports/{uid}`.
- Stored fields: Firebase UID, display name, email, photo URL, sign-in provider, account creation time, last sign-in time and last app activity time.
- Weekly Excel report of **all Firebase Authentication accounts**, including accounts created before this report feature, sent to `siddhagroupss@gmail.com` every Sunday at 08:00 India time (02:30 UTC).
- Privacy notice at `privacy.html`.
- Firestore client rules restrict each signed-in user to their own profile. The scheduled report uses Firebase Admin SDK.

## One-time deployment configuration still required
The code cannot safely change provider settings or create deployment secrets in Firebase/Netlify on the owner's behalf. Before preview testing:

1. Firebase Console → Authentication → Sign-in method: confirm Google is enabled.
2. Firebase Console → Authentication → Settings → Authorized domains: ensure `app.siddhaastro.in`, `siddhasankalpa.netlify.app`, and the exact Deploy Preview hostname are present.
3. Firebase Console → Firestore Database → Rules: publish the contents of `firestore.rules`.
4. In Netlify, enable Deploy Previews for pull requests. The preview branch itself does not alter the production branch.
5. Add these Netlify environment variables with Functions scope:
   - `FIREBASE_SERVICE_ACCOUNT_JSON`: complete Firebase Admin service-account JSON for project `siddha-astro-bf578` (secret).
   - `RESEND_API_KEY`: Resend API key (secret).
   - `REPORT_FROM_EMAIL`: sender address verified in Resend.
6. Verify the sender domain/address in Resend. The email function cannot send until this is configured.

## Schedule and preview limitation
Netlify Scheduled Functions run from the production deployment; they do not run automatically from Deploy Previews. The schedule is `30 2 * * 0` UTC, equivalent to Sunday 08:00 Asia/Kolkata. Keep the schedule disabled until the changes are reviewed, the required secrets are configured, and a test email with synthetic data has been verified. Do not merge to production until preview authentication and reporting are tested.

## Testing checklist
- Google login from desktop and iPhone / Android.
- Refresh and reopen the PWA; the user should remain signed in.
- Sign out and sign back in.
- Verify one Firestore document is created per UID, with no duplicates.
- Update display name.
- Verify a user can read/write only their own profile.
- Generate a test XLSX using synthetic data and verify delivery before enabling the production schedule.

## Data handling
The report contains personal account information. The app displays a privacy notice describing collection and weekly administrator reporting. Keep the spreadsheet confidential and delete it when no longer needed. Do not add passwords, OAuth tokens or Firebase service-account secrets to the repository or report.
