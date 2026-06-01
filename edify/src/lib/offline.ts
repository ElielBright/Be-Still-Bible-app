const DB_NAME = "edify-offline"
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains("chapters")) {
        db.createObjectStore("chapters", { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains("notes")) {
        db.createObjectStore("notes", { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains("highlights")) {
        db.createObjectStore("highlights", { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains("aiResponses")) {
        db.createObjectStore("aiResponses", { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains("userData")) {
        db.createObjectStore("userData", { keyPath: "key" })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function cacheChapter(translation: string, book: string, chapter: number, data: any) {
  const db = await openDB()
  const tx = db.transaction("chapters", "readwrite")
  tx.objectStore("chapters").put({ id: `${translation}:${book}:${chapter}`, data, cachedAt: Date.now() })
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getCachedChapter(translation: string, book: string, chapter: number) {
  const db = await openDB()
  const tx = db.transaction("chapters", "readonly")
  const store = tx.objectStore("chapters")
  const request = store.get(`${translation}:${book}:${chapter}`)
  return new Promise<any>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result?.data || null)
    request.onerror = () => reject(request.error)
  })
}

export async function saveNoteLocally(note: any) {
  const db = await openDB()
  const tx = db.transaction("notes", "readwrite")
  tx.objectStore("notes").put({ ...note, synced: false })
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getLocalNotes() {
  const db = await openDB()
  const tx = db.transaction("notes", "readonly")
  const store = tx.objectStore("notes")
  const request = store.getAll()
  return new Promise<any[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

export async function saveHighlightLocally(highlight: any) {
  const db = await openDB()
  const tx = db.transaction("highlights", "readwrite")
  tx.objectStore("highlights").put({ ...highlight, synced: false })
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getLocalHighlights() {
  const db = await openDB()
  const tx = db.transaction("highlights", "readonly")
  const store = tx.objectStore("highlights")
  const request = store.getAll()
  return new Promise<any[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

export async function cacheAIResponse(verseKey: string, response: string) {
  const db = await openDB()
  const tx = db.transaction("aiResponses", "readwrite")
  tx.objectStore("aiResponses").put({ id: verseKey, response, cachedAt: Date.now() })
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getCachedAIResponse(verseKey: string) {
  const db = await openDB()
  const tx = db.transaction("aiResponses", "readonly")
  const store = tx.objectStore("aiResponses")
  const request = store.get(verseKey)
  return new Promise<string | null>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result?.response || null)
    request.onerror = () => reject(request.error)
  })
}

export async function getUnsyncedItems() {
  const db = await openDB()
  const tx = db.transaction(["notes", "highlights"], "readonly")
  const notesStore = tx.objectStore("notes")
  const highlightsStore = tx.objectStore("highlights")
  const notes = await new Promise<any[]>((resolve) => {
    const req = notesStore.getAll()
    req.onsuccess = () => resolve((req.result || []).filter((n: any) => !n.synced))
  })
  const highlights = await new Promise<any[]>((resolve) => {
    const req = highlightsStore.getAll()
    req.onsuccess = () => resolve((req.result || []).filter((h: any) => !h.synced))
  })
  return { notes, highlights }
}

export async function markAsSynced(storeName: string, id: string) {
  const db = await openDB()
  const tx = db.transaction(storeName, "readwrite")
  const store = tx.objectStore(storeName)
  const req = store.get(id)
  req.onsuccess = () => {
    const item = req.result
    if (item) {
      item.synced = true
      store.put(item)
    }
  }
}
