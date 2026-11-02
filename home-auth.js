import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const link = document.getElementById("homeProfileLink");
const photo = document.getElementById("homeProfilePhoto");
if (link && photo && firebaseConfig?.apiKey && firebaseConfig?.authDomain) {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    onAuthStateChanged(auth, user => {
      if (!user) {
        link.classList.remove("is-signed-in");
        link.setAttribute("aria-label", "Sign in or view profile");
        link.title = "Login";
        photo.removeAttribute("src");
        return;
      }
      const profilePhoto = user.photoURL || "";
      if (profilePhoto) {
        photo.onerror = () => {
          link.classList.remove("is-signed-in");
          link.setAttribute("aria-label", "View profile");
          link.title = "View profile";
        };
        photo.onload = () => link.classList.add("is-signed-in");
        photo.src = profilePhoto;
      } else {
        link.classList.remove("is-signed-in");
      }
      link.setAttribute("aria-label", "View profile for " + (user.displayName || "your Google account"));
      link.title = user.displayName ? user.displayName + " — My Profile" : "My Profile";
    }, error => {
      console.error("Could not load home profile state:", error);
      link.classList.remove("is-signed-in");
    });
  } catch (error) {
    console.error("Could not initialize home profile:", error);
  }
}
