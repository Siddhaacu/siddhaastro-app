const required = ["FIREBASE_API_KEY", "FIREBASE_AUTH_DOMAIN", "FIREBASE_PROJECT_ID", "FIREBASE_APP_ID"];
export default async (request) => {
  if (request.method !== "GET") return Response.json({ configured: false, message: "Method not allowed." }, { status: 405, headers: { Allow: "GET" } });
  const values = {};
  for (const key of required) values[key] = (Netlify.env.get(key) || "").trim();
  const missing = required.filter((key) => !values[key]);
  if (missing.length) return Response.json({
    configured: false,
    message: "Google sign-in is not configured yet. The site owner must complete the Firebase Web App settings.",
    missing
  }, { status: 503, headers: { "Cache-Control": "no-store" } });
  const config = {
    apiKey: values.FIREBASE_API_KEY,
    authDomain: values.FIREBASE_AUTH_DOMAIN,
    projectId: values.FIREBASE_PROJECT_ID,
    appId: values.FIREBASE_APP_ID
  };
  const senderId = (Netlify.env.get("FIREBASE_MESSAGING_SENDER_ID") || "").trim();
  if (senderId) config.messagingSenderId = senderId;
  return Response.json({ configured: true, config }, { headers: { "Cache-Control": "no-store" } });
};
