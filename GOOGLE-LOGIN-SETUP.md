# Google Sign-In and weekly user report setup
This feature is prepared on a separate branch and is not live in production.

1. Create a Firebase project (start on the free Spark plan).
2. In Firebase Authentication, enable Google and add the deployed site domain to Authorized domains.
3. Create a Firebase Web App and replace the placeholders in firebase-config.js with its public web config.
4. Create Cloud Firestore and publish firestore.rules.
5. The profile screen and sign-in UI will then work. The weekly Excel report is not active yet: it needs a scheduled server-side function, Firebase Admin credentials, and an email provider API key configured as Netlify environment secrets. Never put these secrets in browser code or Git.
6. Publish a privacy notice explaining what account details are collected and how they are used. The checkbox on the sign-in screen records consent for inclusion in the weekly administrator report.

Before calling this complete, test sign-in, profile update, sign-out, account deletion, and receipt of a test Excel workbook at siddhagroupss@gmail.com. Free-tier limits and provider terms may change.

## Weekly Excel email
The scheduled function runs every Monday at 04:00 UTC (09:30 India time). Configure these Netlify environment variables with Functions scope:
- `FIREBASE_SERVICE_ACCOUNT_JSON`: full JSON service-account key from Firebase Admin SDK (store as a secret; never commit it).
- `RESEND_API_KEY`: Resend API key.
- `REPORT_FROM_EMAIL`: a sender address verified with Resend.
The report sends an actual .xlsx attachment to `siddhagroupss@gmail.com` and includes only Firestore records with `consentToWeeklyReport: true`. The first run must be tested after configuration. Set up billing/quotas carefully and restrict access to the service-account key.
