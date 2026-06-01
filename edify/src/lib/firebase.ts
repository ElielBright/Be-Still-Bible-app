import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getMessaging, isSupported } from "firebase/messaging"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBeOhX_qvMsf1SnGjSBVN29jpWQVbhX9uQ",
  authDomain: "edify-bible-app.firebaseapp.com",
  projectId: "edify-bible-app",
  storageBucket: "edify-bible-app.firebasestorage.app",
  messagingSenderId: "39135039352",
  appId: "1:39135039352:web:2d822b42a8dad7d11e028d",
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()
const db = getFirestore(app)

let messaging: ReturnType<typeof getMessaging> | null = null

export async function getFirebaseMessaging() {
  if (typeof window !== "undefined" && (await isSupported())) {
    messaging = getMessaging(app)
  }
  return messaging
}

export { app, auth, googleProvider, db }
