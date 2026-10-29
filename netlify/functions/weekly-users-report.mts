import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import ExcelJS from "exceljs";

export default async () => {
  const serviceAccountText = Netlify.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
  const resendApiKey = Netlify.env.get("RESEND_API_KEY");
  const fromEmail = Netlify.env.get("REPORT_FROM_EMAIL");
  const recipient = "siddhagroupss@gmail.com";

  if (!serviceAccountText || !resendApiKey || !fromEmail) {
    console.error("Weekly report is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON, RESEND_API_KEY, and REPORT_FROM_EMAIL in Netlify environment variables.");
    return new Response("Weekly report configuration missing.", { status: 500 });
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountText);
    const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore(app);
    const snapshot = await db.collection("userReports")
      .where("consentToWeeklyReport", "==", true)
      .get();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Siddha Astro";
    workbook.created = new Date();
    const sheet = workbook.addWorksheet("Consented Users");
    sheet.columns = [
      { header: "Email Address", key: "email", width: 36 },
      { header: "Display Name", key: "displayName", width: 30 },
      { header: "Account Created (UTC)", key: "createdAt", width: 26 },
      { header: "Last Sign-In (UTC)", key: "lastSignInAt", width: 26 },
      { header: "Report Consent", key: "consent", width: 18 }
    ];
    sheet.getRow(1).font = { bold: true };
    for (const doc of snapshot.docs) {
      const user = doc.data();
      sheet.addRow({
        email: user.email || "",
        displayName: user.displayName || "",
        createdAt: asIso(user.createdAt),
        lastSignInAt: asIso(user.lastSignInAt),
        consent: user.consentToWeeklyReport ? "Yes" : "No"
      });
    }
    sheet.views = [{ state: "frozen", ySplit: 1 }];
    sheet.autoFilter = { from: "A1", to: "E1" };
    const bytes = await workbook.xlsx.writeBuffer();
    const date = new Date().toISOString().slice(0, 10);
    const attachment = Buffer.from(bytes).toString("base64");
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromEmail,
        to: [recipient],
        subject: `Siddha Astro weekly user report — ${date}`,
        text: `Attached is the weekly Siddha Astro account report for users who consented to inclusion. Total records: ${snapshot.size}. Please store this file securely.`,
        attachments: [{ filename: `siddha-astro-users-${date}.xlsx`, content: attachment }]
      })
    });
    if (!emailResponse.ok) {
      const detail = await emailResponse.text();
      console.error("Resend rejected the weekly report email:", detail);
      return new Response("Email provider rejected the report.", { status: 502 });
    }
    return Response.json({ sent: true, records: snapshot.size, recipient });
  } catch (error) {
    console.error("Weekly report failed:", error);
    return new Response("Weekly report failed. Check Netlify function logs.", { status: 500 });
  }
};

function asIso(value) {
  if (!value) return "";
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

export const config = { schedule: "0 4 * * 1" };
