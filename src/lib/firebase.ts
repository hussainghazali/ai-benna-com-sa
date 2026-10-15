import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA79Q0W3e7or7td2iXxJO0u1ub8vBjtpss",
  authDomain: "vendor-chats.firebaseapp.com",
  projectId: "vendor-chats",
  storageBucket: "vendor-chats.firebasestorage.app",
  messagingSenderId: "783832582550",
  appId: "1:783832582550:web:3e8706c3f7366c1f7d35b7",
  measurementId: "G-C1XRR1E7LM",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function ensureAnonymousAuth() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) return resolve(user);
      try {
        const cred = await signInAnonymously(auth);
        resolve(cred.user);
      } catch (e) {
        reject(e);
      }
    });
  });
}

export { app, db, auth, ensureAnonymousAuth };
