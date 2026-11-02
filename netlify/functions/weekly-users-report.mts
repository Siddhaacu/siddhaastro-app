import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import ExcelJS from "exceljs";

const RECIPIENT = "siddhagroupss@gmail.com";

export default async () => {
  const serviceAccountText = Netlify.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
  const resendApiKey = Netlify.env.get("RESEND_API_KEY");
  const fromEmail = Netlify.env.get("REPORT_FROM_EMAIL");

  if (!serviceAccountText || !resendApiKey || !fromEmail) {
    console.error("Weekly report is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON, RESEND_API_KEY and REPORT_FROM_EMAIL in Netlify environment variables.");
    return new Response("Weekly report configuration missing.", { status: 500 });
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountText);
    const app = getApps().length
      ? getApps()[0]
      : initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore(app);

    // Include every Siddha Astro account profile, not only users who tick a reporting checkbox.
    const snapshot = await db.collection("userReports").get();
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Siddha Astro";
    workbook.created = new Date();

    const summary = workbook.addWorksheet("Weekly Summary");
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const users = snapshot.docs.map(item => ({ uid: item.id, ...item.data() }));
    const createdThisWeek = users.filter(user => toDate(user.createdAt) >= weekAgo).length;
    const activeThisWeek = users.filter(user => toDate(user.lastSeenAt) >= weekAgo).length;
    summary.addRows([
      ["Siddha Astro — Weekly User Report"],
      ["Report generated (UTC)", now.toISOString()],
      ["Total registered users", users.length],
      ["New registrations (last 7 days)", createdThisWeek],
      ["Users active in app (last 7 days)", activeThisWeek],
      ["Delivery day", "Sunday, 08:00 IST"],
      ["Scope", "All user profiles currently stored in Firestore"]
    ]);
    summary.getColumn(1).width = 42;
    summary.getColumn(2).width = 52;
    summary.getRow(1).font = { bold: true, size: 14 };
    summary.getColumn(1).font = { bold: true };

    const sheet = workbook.addWorksheet("All Registered Users");
    sheet.columns = [
      { header: "Firebase User ID", key: "uid", width: 30 },
      { header: "Display Name", key: "displayName", width: 28 },
      { header: "Email Address", key: "email", width: 36 },
      { header: "Sign-in Provider", key: "provider", width: 18 },
      { header: "Account Created (UTC)", key: "createdAt", width: 27 },
      { header: "Last Sign-In (UTC)", key: "lastSignInAt", width: 27 },
      { header: "Last Seen in App (UTC)", key: "lastSeenAt", width: 27 }
    ];
    sheet.getRow(1).font = { bold: true };
    for (const user of users) {
      sheet.addRow({
        uid: user.uid,
        displayName: safeCell(user.displayName),
        email: safeCell(user.email),
        provider: safeCell(user.signInProvider),
        createdAt: formatDate(user.createdAt),
        lastSignInAt: formatDate(user.lastSignInAt),
        lastSeenAt: formatDate(user.lastSeenAt)
      });
    }
    sheet.views = [{ state: "frozen", ySplit: 1 }];
    sheet.autoFilter = { from: "A1", to: "G1" };

    const bytes = await workbook.xlsx.writeBuffer();
    const date = now.toISOString().slice(0, 10);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [RECIPIENT],
        subject: `Siddha Astro weekly user report — ${date}`,
        text: `Attached is the weekly Siddha Astro user report. Total registered profiles: ${users.length}; new registrations in the last 7 days: ${createdThisWeek}; active in the app in the last 7 days: ${activeThisWeek}. The attachment contains the account details currently stored by Siddha Astro. Handle it as confidential personal data.`,
        attachments: [{
          filename: `siddha-astro-users-${date}.xlsx`,
          content: Buffer.from(bytes).toString("base64")
        }]
      })
    });

    if (!response.ok) {
      console.error("Email provider rejected weekly report:", await response.text());
      return new Response("Email provider rejected the report.", { status: 502 });
    }
    return Response.json({ sent: true, records: users.length, recipient: RECIPIENT });
  } catch (error) {
    console.error("Weekly report failed:", error);
    return new Response("Weekly report failed. Check Netlify function logs.", { status: 500 });
  }
};

function toDate(value) {
  if (!value) return new Date(0);
  if (typeof value.toDate === "function") return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function formatDate(value) {
  const date = toDate(value);
  return date.getTime() ? date.toISOString() : "";
}

function safeCell(value) {
  const text = String(value || "");
  // Prevent spreadsheet formula injection from profile fields.
  return /^[=+@-]/.test(text) ? "'" + text : text;
}

export const config = { schedule: "30 2 * * 0" };
