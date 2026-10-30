import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult,
  onAuthStateChanged, updateProfile, signOut, deleteUser
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, setDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { loadFirebaseConfig } from "./firebase-config.js";

const el = (id) => document.getElementById(id);
const status = el("authStatus"), profileStatus = el("profileStatus"), signedOut = el("signedOut"), signedIn = el("signedIn");
const googleButton = el("googleSignIn"), consent = el("reportConsent"), menu = el("profileMenu"), menuToggle = el("menuToggle");
const profileForm = el("profileForm"), displayName = el("displayName"), emailInput = el("email"), greeting = el("greeting"), avatar = el("avatar");
const signOutButton = el("signOut"), deleteButton = el("deleteAccount");
let auth = null, db = null, currentUser = null, busy = false;

function setStatus(message, type) {
  if (!status) return;
  status.textContent = message;
  status.dataset.state = type || "info";
}
function setBusy(value) {
  busy = value;
  if (googleButton) { googleButton.disabled = value || !auth; googleButton.setAttribute("aria-busy", String(value)); }
}
function friendlyAuthError(error) {
  const messages = {
    "auth/unauthorized-domain": "This website domain is not authorized in Firebase. Add app.siddhaastro.in under Authentication → Settings → Authorized domains.",
    "auth/operation-not-allowed": "Google sign-in is not enabled in Firebase Authentication.",
    "auth/popup-blocked": "Your browser blocked the Google sign-in window. Please allow pop-ups and try again.",
    "auth/popup-closed-by-user": "Google sign-in was closed before it finished. Please try again.",
    "auth/cancelled-popup-request": "Another sign-in window is already open. Please finish that sign-in first.",
    "auth/network-request-failed": "Network connection failed. Check your internet connection and try again.",
    "auth/too-many-requests": "Too many attempts. Please wait a little and try again."
  };
  return messages[error && error.code] || "Google sign-in could not be completed. Please try again. If it continues, contact Siddha Astro support.";
}
function makeProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  provider.addScope("email"); provider.addScope("profile");
  return provider;
}
async function saveConsent(user) {
  await setDoc(doc(db, "userReports", user.uid), {
    uid: user.uid, email: user.email || "", displayName: user.displayName || "",
    consentToWeeklyReport: true, consentUpdatedAt: serverTimestamp(),
    createdAt: user.metadata.creationTime || new Date().toISOString(),
    lastSignInAt: user.metadata.lastSignInTime || new Date().toISOString()
  }, { merge: true });
}
function showUser(user) {
  currentUser = user;
  if (signedOut) signedOut.classList.toggle("hidden", !!user);
  if (signedIn) signedIn.classList.toggle("hidden", !user);
  if (menu) menu.classList.remove("open");
  if (!user) return;
  if (displayName) displayName.value = user.displayName || "";
  if (emailInput) emailInput.value = user.email || "";
  if (greeting) greeting.textContent = "Hi there, " + (user.displayName || "Siddha Astro user") + "!";
  const fallback = avatar && avatar.querySelector("svg");
  if (fallback) fallback.style.display = user.photoURL ? "none" : "block";
  if (avatar && user.photoURL) {
    let image = avatar.querySelector("img");
    if (!image) { image = document.createElement("img"); image.alt = "Google profile photo"; image.style.cssText = "width:100%;height:100%;object-fit:cover"; avatar.prepend(image); }
    image.src = user.photoURL;
  }
}
async function initializeAuth() {
  try {
    const config = await loadFirebaseConfig();
    const app = initializeApp(config);
    auth = getAuth(app); db = getFirestore(app); setBusy(false);
    try {
      const result = await getRedirectResult(auth);
      if (result && result.user) {
        const agreed = sessionStorage.getItem("siddhaastro-report-consent") === "yes";
        sessionStorage.removeItem("siddhaastro-report-consent");
        if (agreed) await saveConsent(result.user);
        setStatus("Signed in successfully.", "success");
      }
    } catch (error) {
      console.error("Firebase redirect sign-in failed:", error);
      setStatus(friendlyAuthError(error), "error");
    }
    onAuthStateChanged(auth, showUser, (error) => {
      console.error("Firebase auth state error:", error);
      setStatus("Unable to check your sign-in status. Refresh the page and try again.", "error");
    });
    googleButton.addEventListener("click", async () => {
      if (busy) return;
      if (!consent.checked) { setStatus("Please confirm the weekly account-report notice before continuing.", "error"); consent.focus(); return; }
      setBusy(true); setStatus("Connecting securely to Google…");
      try {
        const provider = makeProvider();
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
          sessionStorage.setItem("siddhaastro-report-consent", "yes");
          await signInWithRedirect(auth, provider);
          return;
        }
        const result = await signInWithPopup(auth, provider);
        await saveConsent(result.user);
        setStatus("Signed in successfully.", "success");
      } catch (error) {
        console.error("Google sign-in failed:", error);
        setStatus(friendlyAuthError(error), "error"); setBusy(false);
      }
    });
    profileForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!currentUser) return;
      const name = displayName.value.trim();
      if (!name) { profileStatus.textContent = "Please enter your name."; displayName.focus(); return; }
      const button = profileForm.querySelector('button[type="submit"]');
      if (button) button.disabled = true;
      profileStatus.textContent = "Saving profile…";
      try {
        await updateProfile(currentUser, { displayName: name });
        await setDoc(doc(db, "userReports", currentUser.uid), { displayName: name }, { merge: true });
        greeting.textContent = "Hi there, " + name + "!";
        profileStatus.textContent = "Profile updated successfully.";
      } catch (error) {
        console.error("Profile update failed:", error);
        profileStatus.textContent = "Unable to save your profile. Please check your connection and try again.";
      } finally { if (button) button.disabled = false; }
    });
    signOutButton.addEventListener("click", async () => {
      try { await signOut(auth); profileStatus.textContent = "You have signed out."; }
      catch (error) { console.error("Sign-out failed:", error); profileStatus.textContent = "Unable to sign out. Please try again."; }
    });
    deleteButton.addEventListener("click", async () => {
      if (!currentUser || !confirm("Delete your Siddha Astro account? This cannot be undone.")) return;
      deleteButton.disabled = true;
      try {
        await deleteDoc(doc(db, "userReports", currentUser.uid));
        await deleteUser(currentUser);
        profileStatus.textContent = "Your account has been deleted.";
      } catch (error) {
        console.error("Account deletion failed:", error);
        profileStatus.textContent = error.code === "auth/requires-recent-login"
          ? "For security, sign in again before deleting your account."
          : "Could not delete your account. Please sign in again and retry.";
      } finally { deleteButton.disabled = false; }
    });
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    const missing = error && error.missing && error.missing.length ? " Missing Netlify settings: " + error.missing.join(", ") + "." : "";
    setStatus((error && error.message ? error.message : "Firebase could not be initialized.") + missing, "error");
    if (googleButton) { googleButton.disabled = true; googleButton.setAttribute("aria-disabled", "true"); }
  }
}
menuToggle.addEventListener("click", () => menu.classList.toggle("open"));
document.addEventListener("click", (event) => { if (!menu.contains(event.target) && event.target !== menuToggle) menu.classList.remove("open"); });
setBusy(true);
initializeAuth();
