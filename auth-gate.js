import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

// Keep account and policy pages accessible before sign-in.
const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
const isNetlifyDeployPreview = location.hostname.startsWith("deploy-preview-") && location.hostname.endsWith(".netlify.app");
if (isNetlifyDeployPreview || window.self !== window.top || ["profile.html", "policies.html", "privacy.html"].includes(page)) {
  // Public entry and information pages do not need the app-wide gate.
} else {
  const style = document.createElement("style");
  style.textContent = "html.siddha-auth-checking body > .app{visibility:hidden!important}.siddha-auth-gate{position:fixed;inset:0;z-index:100000;display:grid;place-items:center;padding:24px;background:var(--page,#f5f7f3);color:var(--text,#17231d);font-family:inherit;text-align:center}.siddha-auth-gate-card{width:min(100%,420px);padding:30px 24px;border:1px solid var(--border,#dce4dc);border-radius:22px;background:var(--surface,#fff);box-shadow:0 12px 40px #00000012}.siddha-auth-gate img{width:72px;height:72px;object-fit:contain;margin-bottom:12px}.siddha-auth-gate h1{margin:0 0 10px;font-size:1.45rem}.siddha-auth-gate p{margin:0;line-height:1.6;color:var(--muted,#64736a)}.siddha-auth-gate a{display:inline-flex;justify-content:center;margin-top:20px;padding:13px 22px;border-radius:14px;background:var(--accent,#b45b25);color:white;font-weight:700;text-decoration:none}";
  document.head.appendChild(style);
  document.documentElement.classList.add("siddha-auth-checking");
  const gate = document.createElement("div");
  gate.className = "siddha-auth-gate";
  gate.setAttribute("role", "status");
  gate.innerHTML = '<div class="siddha-auth-gate-card"><img src="/logo.png" alt="Siddha Astro"><h1>Checking your sign-in</h1><p>Please wait while we securely verify your Google account.</p></div>';
  document.body.appendChild(gate);
  const returnPath = location.pathname + location.search + location.hash;
  const showSignInRequired = () => location.replace("/profile.html?return=" + encodeURIComponent(returnPath));
  const showFallback = () => {
    gate.innerHTML = '<div class="siddha-auth-gate-card"><img src="/logo.png" alt="Siddha Astro"><h1>Google sign-in required</h1><p>We could not verify your session. Please sign in with Google to continue.</p><a href="/profile.html?return=' + encodeURIComponent(returnPath) + '">Continue to Google sign-in</a></div>';
  };
  try {
    if (!firebaseConfig?.apiKey || !firebaseConfig?.authDomain || !firebaseConfig?.projectId || !firebaseConfig?.appId) throw new Error("Firebase Authentication is not configured.");
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    onAuthStateChanged(auth, user => {
      if (user) { gate.remove(); document.documentElement.classList.remove("siddha-auth-checking"); }
      else showSignInRequired();
    }, error => { console.error("Could not verify Siddha Astro sign-in:", error); showFallback(); });
  } catch (error) { console.error("Siddha Astro authentication gate could not start:", error); showFallback(); }
}
