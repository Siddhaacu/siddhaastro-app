import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

// Public account and policy pages remain accessible without an app session.
const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
const isNetlifyDeployPreview = location.hostname.startsWith("deploy-preview-") && location.hostname.endsWith(".netlify.app");
if (isNetlifyDeployPreview || window.self !== window.top || ["profile.html", "policies.html", "privacy.html"].includes(page)) {
  // No app-wide sign-in gate on these pages.
} else {
  const style = document.createElement("style");
  style.textContent = "html.siddha-auth-checking body > .app{visibility:hidden!important}.siddha-auth-gate{position:fixed;inset:0;z-index:100000;display:grid;place-items:center;padding:24px;background:var(--page,#f5f7f3);color:var(--text,#17231d);font-family:inherit;text-align:center}.siddha-auth-gate-card{width:min(100%,420px);padding:30px 24px;border:1px solid var(--border,#dce4dc);border-radius:22px;background:var(--surface,#fff);box-shadow:0 12px 40px #00000012}.siddha-auth-gate img{width:72px;height:72px;object-fit:contain;margin-bottom:12px}.siddha-auth-gate h1{margin:0 0 10px;font-size:1.45rem}.siddha-auth-gate p{margin:0;line-height:1.6;color:var(--muted,#64736a)}.siddha-auth-gate a{display:inline-flex;justify-content:center;margin-top:20px;padding:13px 22px;border-radius:14px;background:var(--accent,#b45b25);color:white;font-weight:700;text-decoration:none}";
  document.head.appendChild(style);
  document.documentElement.classList.add("siddha-auth-checking");

  const gate = document.createElement("div");
  gate.className = "siddha-auth-gate";
  gate.setAttribute("role", "status");
  gate.innerHTML = '<div class="siddha-auth-gate-card"><img src="/logo.png" alt="Siddha Astro"><p>Restoring your Siddha Astro session…</p></div>';
  document.body.appendChild(gate);

  const returnPath = location.pathname + location.search + location.hash;
  const signInUrl = "/profile.html?return=" + encodeURIComponent(returnPath);
  const showSignInRequired = () => location.replace(signInUrl);
  const showFallback = () => {
    gate.innerHTML = '<div class="siddha-auth-gate-card"><img src="/logo.png" alt="Siddha Astro"><h1>Sign-in could not be verified</h1><p>Your saved Google session could not be restored. Please open your profile and sign in again.</p><a href="' + signInUrl + '">Continue to Google sign-in</a></div>';
  };

  (async () => {
    try {
      if (!firebaseConfig?.apiKey || !firebaseConfig?.authDomain || !firebaseConfig?.projectId || !firebaseConfig?.appId) {
        throw new Error("Firebase Authentication is not configured.");
      }

      // Reuse the default app and wait for Firebase's initial persisted-session
      // restore. Never change persistence here: the Profile page sets it once
      // before Google sign-in. Changing it on every page can race restoration.
      const app = getApps().find(item => item.name === "[DEFAULT]") || initializeApp(firebaseConfig);
      const auth = getAuth(app);
      await auth.authStateReady();

      if (!auth.currentUser) {
        showSignInRequired();
        return;
      }

      gate.remove();
      document.documentElement.classList.remove("siddha-auth-checking");

      // Keep the gate in sync if the user explicitly signs out on another tab.
      onAuthStateChanged(auth, user => {
        if (!user) showSignInRequired();
      }, error => {
        console.error("Siddha Astro authentication state failed:", error);
        showFallback();
      });
    } catch (error) {
      console.error("Siddha Astro authentication gate could not start:", error);
      showFallback();
    }
  })();
}
