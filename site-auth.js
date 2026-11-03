import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = getApps().find(item => item.name === "[DEFAULT]") || initializeApp(firebaseConfig);
const auth = getAuth(app);
let currentUser = null;
let resolveReady;
const ready = new Promise(resolve => { resolveReady = resolve; });

function ensureProfileLink() {
  const header = document.querySelector(".header-inner");
  if (!header) return null;
  let link = document.getElementById("homeProfileLink") || document.getElementById("siteProfileLink");
  if (!link) {
    link = document.createElement("a");
    link.id = "siteProfileLink";
    link.className = "site-profile-link";
    link.href = "/profile.html";
    link.setAttribute("aria-label", "Sign in or view profile");
    link.title = "Login";
    link.innerHTML = '<svg class="site-profile-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4.5 21a7.5 7.5 0 0 1 15 0"></path></svg><img class="site-profile-photo" alt="" referrerpolicy="no-referrer">';
    header.append(link);
  }
  return link;
}

function applyUser(user) {
  const link = ensureProfileLink();
  if (link) {
    const photo = link.querySelector("img");
    const icon = link.querySelector("svg");
    if (user) {
      link.classList.add("is-signed-in");
      link.setAttribute("aria-label", "View profile for " + (user.displayName || "your Google account"));
      link.title = user.displayName ? user.displayName + " — My Profile" : "My Profile";
      if (photo && user.photoURL) {
        photo.onerror = () => { photo.hidden = true; if (icon) icon.hidden = false; };
        photo.onload = () => { photo.hidden = false; if (icon) icon.hidden = true; };
        photo.src = user.photoURL;
      } else if (photo) {
        photo.removeAttribute("src");
        photo.hidden = true;
        if (icon) icon.hidden = false;
      }
    } else {
      link.classList.remove("is-signed-in");
      link.setAttribute("aria-label", "Sign in to Siddha Astro");
      link.title = "Login";
      if (photo) { photo.removeAttribute("src"); photo.hidden = true; }
      if (icon) icon.hidden = false;
    }
  }
  window.dispatchEvent(new CustomEvent("siddha-auth-state", {
    detail: { user: user ? { uid: user.uid, displayName: user.displayName || "", email: user.email || "", photoURL: user.photoURL || "" } : null }
  }));
}

const style = document.createElement("style");
style.textContent = ".site-profile-link{display:grid;place-items:center;width:42px;height:42px;flex:0 0 42px;margin-left:auto;border:1px solid var(--border);border-radius:50%;background:var(--surface);color:var(--accent-dark);text-decoration:none;overflow:hidden}.site-profile-link svg{width:23px;height:23px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.site-profile-link img{width:100%;height:100%;object-fit:cover;border-radius:50%}.site-profile-link img[hidden],.site-profile-link svg[hidden]{display:none}.site-profile-link:focus-visible{outline:2px solid var(--gold);outline-offset:3px}";
document.head.append(style);

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    onAuthStateChanged(auth, user => {
      currentUser = user;
      applyUser(user);
      resolveReady(user);
    }, error => {
      console.error("Siddha Astro session check failed:", error);
      applyUser(null);
      resolveReady(null);
    });
  })
  .catch(error => {
    console.error("Could not restore Siddha Astro session:", error);
    applyUser(null);
    resolveReady(null);
  });

window.SiddhaAuth = {
  auth,
  ready,
  getCurrentUser: () => currentUser
};
