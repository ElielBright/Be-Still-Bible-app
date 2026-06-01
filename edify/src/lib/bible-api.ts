export const BIBLE_TRANSLATIONS = [
  { id: "kjv", code: "KJV", name: "King James Version", free: true },
  { id: "web", code: "WEB", name: "World English Bible", free: true },
  { id: "ylt", code: "YLT", name: "Young's Literal Translation", free: true },
  { id: "darby", code: "Darby", name: "Darby Translation", free: true },
  { id: "bbe", code: "BBE", name: "Bible in Basic English", free: true },
  { id: "niv", code: "NIV", name: "New International Version", free: false },
  { id: "nkjv", code: "NKJV", name: "New King James Version", free: false },
  { id: "esv", code: "ESV", name: "English Standard Version", free: false },
  { id: "nlt", code: "NLT", name: "New Living Translation", free: false },
  { id: "msg", code: "MSG", name: "The Message", free: false },
  { id: "asv", code: "ASV", name: "American Standard Version", free: true },
]

export const BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon",
  "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah",
  "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians",
  "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians",
  "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James",
  "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation",
]

export const BOOK_CHAPTER_COUNT: Record<string, number> = {
  Genesis: 50, Exodus: 40, Leviticus: 27, Numbers: 36, Deuteronomy: 34, Joshua: 24,
  Judges: 21, Ruth: 4, "1 Samuel": 31, "2 Samuel": 24, "1 Kings": 22, "2 Kings": 25,
  "1 Chronicles": 29, "2 Chronicles": 36, Ezra: 10, Nehemiah: 13, Esther: 10, Job: 42,
  Psalms: 150, Proverbs: 31, Ecclesiastes: 12, "Song of Solomon": 8, Isaiah: 66,
  Jeremiah: 52, Lamentations: 5, Ezekiel: 48, Daniel: 12, Hosea: 14, Joel: 3, Amos: 9,
  Obadiah: 1, Jonah: 4, Micah: 7, Nahum: 3, Habakkuk: 3, Zephaniah: 3, Haggai: 2,
  Zechariah: 14, Malachi: 4, Matthew: 28, Mark: 16, Luke: 24, John: 21, Acts: 28,
  Romans: 16, "1 Corinthians": 16, "2 Corinthians": 13, Galatians: 6, Ephesians: 6,
  Philippians: 4, Colossians: 4, "1 Thessalonians": 5, "2 Thessalonians": 3, "1 Timothy": 6,
  "2 Timothy": 4, Titus: 3, Philemon: 1, Hebrews: 13, James: 5, "1 Peter": 5, "2 Peter": 3,
  "1 John": 5, "2 John": 1, "3 John": 1, Jude: 1, Revelation: 22,
}

export interface BibleVerse {
  number: number
  text: string
}

export interface BibleChapter {
  book: string
  chapter: number
  verses: BibleVerse[]
  translation: string
}

const BOLLS_MAP: Record<string, string> = {
  niv: "7251",
  nkjv: "1575",
  esv: "1467",
  nlt: "1491",
  msg: "1531",
}

async function fetchFromBibleAPI(book: string, chapter: number): Promise<BibleChapter | null> {
  const resp = await fetch(
    `https://bible-api.com/${encodeURIComponent(book)}+${chapter}?verse-numbers=true`
  )
  if (!resp.ok) return null
  const data = await resp.json()
  return {
    book,
    chapter,
    verses: data.verses.map((v: any) => ({ number: v.verse, text: v.text })),
    translation: "kjv",
  }
}

async function fetchFromBolls(translationId: string, book: string, chapter: number): Promise<BibleChapter | null> {
  const bollsId = BOLLS_MAP[translationId]
  if (!bollsId) return null
  const resp = await fetch(
    `https://bolls.life/api/v1/text/${bollsId}/${encodeURIComponent(book)}/${chapter}/`
  )
  if (!resp.ok) return null
  const data = await resp.json()
  return {
    book,
    chapter,
    verses: data.map((v: any) => ({ number: v.verse, text: v.text })),
    translation: translationId,
  }
}

export async function fetchChapter(
  translationId: string,
  book: string,
  chapter: number
): Promise<BibleChapter | null> {
  try {
    if (translationId === "kjv") {
      return await fetchFromBibleAPI(book, chapter)
    }
    const bolls = await fetchFromBolls(translationId, book, chapter)
    if (bolls) return bolls
    return await fetchFromBibleAPI(book, chapter)
  } catch {
    return null
  }
}

export async function fetchVerse(
  translationId: string,
  book: string,
  chapter: number,
  verse: number
): Promise<string | null> {
  const data = await fetchChapter(translationId, book, chapter)
  return data?.verses.find((v) => v.number === verse)?.text || null
}
