import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
  getRedirectResult, onAuthStateChanged, setPersistence, browserLocalPersistence,
  updateProfile, signOut, deleteUser
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, deleteDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const $ = id => document.getElementById(id);
const status = $("authStatus");
const profileStatus = $("profileStatus");
const signedOut = $("signedOut");
const authLoading = $("authLoading");
const signedIn = $("signedIn");
const googleButton = $("googleSignIn");
const menu = $("profileMenu");
const menuToggle = $("menuToggle");
const profileForm = $("profileForm");
const displayName = $("displayName");
const emailInput = $("email");
const greeting = $("greeting");
const avatar = $("avatar");
const requestedReturn = new URLSearchParams(location.search).get("return");

let auth;
let db;
let currentUser = null;
let authReady = false;

const configured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain &&
  firebaseConfig.projectId && firebaseConfig.appId &&
  !firebaseConfig.apiKey.startsWith("YOUR_") &&
  !firebaseConfig.projectId.startsWith("YOUR_")
);

if (!configured) {
  authLoading?.classList.add("hidden");
  signedOut.classList.remove("hidden");
  status.textContent = "Sign-in is temporarily unavailable because the Firebase web configuration is incomplete.";
  googleButton.disabled = true;
} else {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  // Keep the user's session on this device across browser/app restarts.
  const persistenceReady = setPersistence(auth, browserLocalPersistence);

  googleButton.addEventListener("click", async () => {
    googleButton.disabled = true;
    status.textContent = "Connecting to Google…";
    try {
      await persistenceReady;
      // Redirect is more reliable in mobile browsers and installed PWAs.
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        await signInWithRedirect(auth, provider);
        return;
      }
      await signInWithPopup(auth, provider);
      status.textContent = "Signed in successfully.";
    } catch (error) {
      console.error("Google sign-in failed:", error);
      if (["auth/popup-blocked", "auth/operation-not-supported-in-this-environment"].includes(error.code)) {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError) {
          console.error("Google redirect sign-in failed:", redirectError);
          status.textContent = friendlyAuthError(redirectError);
        }
      } else {
        status.textContent = friendlyAuthError(error);
      }
      googleButton.disabled = false;
    }
  });

  // On iOS PWAs, initialize persistence before processing the OAuth return.
  // Calling getRedirectResult before persistence is ready can race session restoration.
  const authInitialization = (async () => {
    await persistenceReady;
    try {
      const result = await getRedirectResult(auth);
      if (result?.user && status) status.textContent = "Google sign-in completed. Loading your profile…";
    } catch (error) {
      console.error("Google redirect result failed:", {
        code: error?.code,
        message: error?.message,
        customData: error?.customData
      });
      if (status) status.textContent = friendlyAuthError(error);
    }

    onAuthStateChanged(auth, async user => {
    authLoading?.classList.add("hidden");
    currentUser = user;
    authReady = true;
    signedOut.classList.toggle("hidden", Boolean(user));
    signedIn.classList.toggle("hidden", !user);
    menu.classList.remove("open");
    googleButton.disabled = false;
    if (!user) return;

    displayName.value = user.displayName || "";
    emailInput.value = user.email || "";
    greeting.textContent = "Hi there, " + (user.displayName || "Siddha Astro user") + "!";
    const photo = avatar.querySelector("img");
    avatar.querySelector("svg").style.display = user.photoURL ? "none" : "block";
    if (user.photoURL) {
      const img = photo || document.createElement("img");
      img.alt = "Google profile photo";
      img.style.cssText = "width:100%;height:100%;object-fit:cover";
      if (!photo) avatar.prepend(img);
      img.src = user.photoURL;
    } else if (photo) {
      photo.remove();
    }

    try {
      await syncUserRecord(user);
      if (status) status.textContent = "";
    } catch (error) {
      console.error("Could not sync user profile:", error);
      profileStatus.textContent = "You are signed in, but your profile could not be synced. Please check your connection.";
    }
    if (requestedReturn) {
      try {
        const target = new URL(requestedReturn, location.origin);
        if (target.origin === location.origin && target.pathname !== "/profile.html") {
          location.replace(target.href);
          return;
        }
      } catch (error) {
        console.warn("Ignoring invalid post-login return path:", error);
      }
    }
    });
  })().catch(error => {
    console.error("Firebase session initialization failed:", {
      code: error?.code,
      message: error?.message
    });
    authLoading?.classList.add("hidden");
    signedOut.classList.remove("hidden");
    if (status) status.textContent = friendlyAuthError(error);
    googleButton.disabled = false;
  });

  async function syncUserRecord(user) {
    const userRef = doc(db, "userReports", user.uid);
    const existing = await getDoc(userRef);
    const providerIds = (user.providerData || []).map(item => item.providerId);
    const profile = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      signInProvider: providerIds.includes("google.com") ? "Google" : (providerIds.join(", ") || "Unknown"),
      lastSignInAt: user.metadata.lastSignInTime || "",
      lastSeenAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    if (!existing.exists()) profile.createdAt = user.metadata.creationTime || new Date().toISOString();
    await setDoc(userRef, profile, { merge: true });
  }

  profileForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!currentUser) return;
    const name = displayName.value.trim();
    if (!name) {
      profileStatus.textContent = "Please enter your name.";
      return;
    }
    profileStatus.textContent = "Saving profile…";
    try {
      await updateProfile(currentUser, { displayName: name });
      await setDoc(doc(db, "userReports", currentUser.uid), {
        displayName: name, updatedAt: serverTimestamp()
      }, { merge: true });
      greeting.textContent = "Hi there, " + name + "!";
      profileStatus.textContent = "Profile updated.";
    } catch (error) {
      console.error(error);
      profileStatus.textContent = "Unable to save your profile. Please try again.";
    }
  });

  $("signOut").addEventListener("click", async () => {
    try {
      await signOut(auth);
      profileStatus.textContent = "You have signed out.";
    } catch (error) {
      profileStatus.textContent = "Unable to sign out. Please try again.";
    }
  });

  $("deleteAccount").addEventListener("click", async () => {
    if (!currentUser || !confirm("Delete your Siddha Astro account? This cannot be undone.")) return;
    try {
      const uid = currentUser.uid;
      await deleteDoc(doc(db, "userReports", uid));
      await deleteUser(currentUser);
      profileStatus.textContent = "Your account has been deleted.";
    } catch (error) {
      console.error(error);
      profileStatus.textContent = error.code === "auth/requires-recent-login"
        ? "For security, sign in again before deleting your account."
        : "Could not delete your account. Please sign in again and retry.";
    }
  });
}

function friendlyAuthError(error) {
  const messages = {
    "auth/unauthorized-domain": "This website address is not authorized in Firebase Authentication. Add this domain under Authentication → Settings → Authorized domains.",
    "auth/operation-not-allowed": "Google sign-in is not enabled for this Firebase project.",
    "auth/popup-closed-by-user": "Google sign-in was closed before completion. Please try again.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again."
  };
  const code = error?.code || "unknown-error";
  const detail = messages[code] || error?.message || "No additional error details were provided.";
  return `${detail} (Firebase: ${code})`;
}

menuToggle.addEventListener("click", () => menu.classList.toggle("open"));
document.addEventListener("click", event => {
  if (!menu.contains(event.target) && event.target !== menuToggle) menu.classList.remove("open");
});
