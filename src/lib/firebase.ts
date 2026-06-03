import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getMessaging, isSupported } from "firebase/messaging"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase only if config is valid
const app = getApps().length
  ? getApp()
  : (firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null)

const auth = app ? getAuth(app) : (null as any)
const googleProvider = new GoogleAuthProvider()
const db = app ? getFirestore(app) : (null as any)

let messaging: ReturnType<typeof getMessaging> | null = null

export async function getFirebaseMessaging() {
  if (app && typeof window !== "undefined" && (await isSupported())) {
    messaging = getMessaging(app)
  }
  return messaging
}

export { app, auth, googleProvider, db }

