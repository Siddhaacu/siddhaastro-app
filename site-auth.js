import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

// One shared Firebase app/auth instance for every page. Session restoration is
// handled silently in the background; navigation never opens a login screen.
const app = getApps().find(item => item.name === "[DEFAULT]") || initializeApp(firebaseConfig);
const auth = getAuth(app);
let currentUser = auth.currentUser || null;
let resolveReady;
const ready = new Promise(resolve => { resolveReady = resolve; });

function publishAuthState(user) {
  currentUser = user;
  window.dispatchEvent(new CustomEvent("siddha-auth-state", {
    detail: { user: user ? {
      uid: user.uid,
      displayName: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || ""
    } : null }
  }));
  resolveReady(user);
}

onAuthStateChanged(auth, publishAuthState, error => {
  console.error("Siddha Astro session restore failed:", error);
  publishAuthState(null);
});

window.SiddhaAuth = {
  auth,
  ready,
  getCurrentUser: () => currentUser
};
