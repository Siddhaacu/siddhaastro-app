import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

// Shared Firebase session, restored silently on every page load.
// The profile shortcut is intentionally shown on Home only.
const app = getApps().find(item => item.name === "[DEFAULT]") || initializeApp(firebaseConfig);
const auth = getAuth(app);
let currentUser = auth.currentUser || null;
let resolveReady;
const ready = new Promise(resolve => { resolveReady = resolve; });

function publishAuthState(user) {
  currentUser = user;
  const homeLink = document.getElementById("homeProfileLink");
  if (homeLink) {
    const photo = homeLink.querySelector(".home-profile-photo");
    const icon = homeLink.querySelector(".home-login-icon");
    // The Home header CSS only reveals the Google photo in this signed-in state.
    homeLink.classList.remove("is-signed-in");
    if (user) {
      homeLink.setAttribute("aria-label", "View profile for " + (user.displayName || "your Google account"));
      homeLink.title = user.displayName ? user.displayName + " — My Profile" : "My Profile";
      if (photo && user.photoURL) {
        photo.onerror = () => {
          homeLink.classList.remove("is-signed-in");
          photo.hidden = true;
          if (icon) icon.hidden = false;
        };
        photo.onload = () => {
          photo.hidden = false;
          homeLink.classList.add("is-signed-in");
          if (icon) icon.hidden = true;
        };
        photo.src = user.photoURL;
      } else {
        if (photo) { photo.removeAttribute("src"); photo.hidden = true; }
        homeLink.classList.remove("is-signed-in");
        if (icon) icon.hidden = false;
      }
    } else {
      homeLink.setAttribute("aria-label", "Sign in to Siddha Astro");
      homeLink.title = "Login";
      if (photo) { photo.removeAttribute("src"); photo.hidden = true; }
      homeLink.classList.remove("is-signed-in");
      if (icon) icon.hidden = false;
    }
  }
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

window.SiddhaAuth = { auth, ready, getCurrentUser: () => currentUser };
