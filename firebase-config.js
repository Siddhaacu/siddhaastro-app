// Loads the public Firebase Web App configuration from a same-origin Netlify Function.
export async function loadFirebaseConfig() {
  const response = await fetch("/.netlify/functions/firebase-config", { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" });
  let payload;
  try { payload = await response.json(); } catch { throw new Error("Firebase configuration endpoint returned an invalid response."); }
  if (!response.ok || !payload || !payload.configured || !payload.config) {
    const missing = payload && Array.isArray(payload.missing) ? payload.missing : [];
    const error = new Error((payload && payload.message) || "Firebase web configuration is not complete.");
    error.missing = missing;
    throw error;
  }
  return payload.config;
}
