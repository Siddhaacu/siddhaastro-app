// Public Firebase Web App configuration. Never place Admin SDK keys or email-provider secrets here.
// Use the current deployment hostname for Firebase's redirect helper so the
// /__/auth/* proxy remains same-origin on production and Netlify deploy previews.
const currentHost = window.location.hostname;
const authDomain = ["localhost", "127.0.0.1"].includes(currentHost)
  ? "siddha-astro-bf578.firebaseapp.com"
  : currentHost;

export const firebaseConfig = {
  apiKey: "AIzaSyCIfPJWhQPdvBEbaDkGh-JZUpeVfB9tBRE",
  authDomain,
  projectId: "siddha-astro-bf578",
  storageBucket: "siddha-astro-bf578.firebasestorage.app",
  messagingSenderId: "319549832378",
  appId: "1:319549832378:web:0d46704d7cf19f2a02d683",
  measurementId: "G-J67CKBFPM5"
};
