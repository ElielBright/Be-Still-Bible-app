import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc, deleteDoc } from "firebase/firestore"
import { db } from "./firebase"


export type UserProfile = {
  display_name: string
  photo_url: string | null
  preferred_translation: string
  favorite_preachers: string[]
  notification_time: string | null
  notifications_enabled: boolean
  streak_count: number
  last_quiet_time: string | null
}

export type Note = {
  id?: string
  user_id: string
  book: string
  chapter: number
  verse: number
  content: string
  created_at: string
  updated_at: string
}

export type Highlight = {
  id?: string
  user_id: string
  book: string
  chapter: number
  verse: number
  color: string
  created_at: string
}

export type SavedSermon = {
  id?: string
  user_id: string
  video_id: string
  title: string
  preacher: string
  verse_reference: string
  created_at: string
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const docRef = doc(db, "user_profiles", userId)
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? (docSnap.data() as UserProfile) : null
}

export async function saveUserProfile(userId: string, profile: Partial<UserProfile>) {
  const docRef = doc(db, "user_profiles", userId)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    await updateDoc(docRef, profile)
  } else {
    await setDoc(docRef, { ...profile, created_at: new Date().toISOString() })
  }
}

export async function getUserNotes(userId: string): Promise<Note[]> {
  const q = query(collection(db, "notes"), where("user_id", "==", userId))
  const snapshot = await getDocs(q)
  const notes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Note))
  return notes.sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export async function addNote(note: Omit<Note, "id">) {
  const docRef = await addDoc(collection(db, "notes"), note)
  return docRef.id
}

export async function updateNote(noteId: string, data: Partial<Note>) {
  const docRef = doc(db, "notes", noteId)
  await updateDoc(docRef, data)
}

export async function getUserHighlights(userId: string): Promise<Highlight[]> {
  const q = query(collection(db, "highlights"), where("user_id", "==", userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Highlight))
}

export async function addHighlight(highlight: Omit<Highlight, "id">) {
  const docRef = await addDoc(collection(db, "highlights"), highlight)
  return docRef.id
}

export async function getSavedSermons(userId: string): Promise<SavedSermon[]> {
  const q = query(collection(db, "saved_sermons"), where("user_id", "==", userId))
  const snapshot = await getDocs(q)
  const sermons = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SavedSermon))
  return sermons.sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export async function saveSermon(sermon: Omit<SavedSermon, "id">) {
  const docRef = await addDoc(collection(db, "saved_sermons"), sermon)
  return docRef.id
}
