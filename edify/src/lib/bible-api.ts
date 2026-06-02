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
  { id: "bsb", code: "BSB", name: "Berean Standard Bible", free: true },
  { id: "t4t", code: "T4T", name: "Translation for Translators", free: true },
  { id: "gnt", code: "GNT", name: "Good News Translation", free: false },
  { id: "amp", code: "AMP", name: "Amplified Bible", free: false },
  { id: "erv", code: "ERV", name: "Easy-to-Read Version", free: false },
  { id: "rvr1960", code: "RVR1960", name: "Reina Valera 1960 (Spanish)", free: true },
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

// Map translation IDs to wldeh version IDs
const WLDEH_MAP: Record<string, string> = {
  web: "en-web",
  asv: "en-asv",
  darby: "en-darby",
  bsb: "en-bsb",
  t4t: "en-t4t",
  gnt: "en-t4t",
  erv: "en-t4t",
  rvr1960: "es-rv09",
}

// Map English book names to Spanish book names for RV09
const SPANISH_BOOK_MAP: Record<string, string> = {
  Genesis: "génesis", Exodus: "éxodo", Leviticus: "levítico", Numbers: "números",
  Deuteronomy: "deuteronomio", Joshua: "josué", Judges: "jueces", Ruth: "rut",
  "1 Samuel": "1samuel", "2 Samuel": "2samuel", "1 Kings": "1reyes", "2 Kings": "2reyes",
  "1 Chronicles": "1crónicas", "2 Chronicles": "2crónicas", Ezra: "esdras",
  Nehemiah: "nehemías", Esther: "ester", Job: "job", Psalms: "salmos",
  Proverbs: "proverbios", Ecclesiastes: "eclesiastés", "Song of Solomon": "cantares",
  Isaiah: "isaías", Jeremiah: "jeremías", Lamentations: "lamentaciones",
  Ezekiel: "ezequiel", Daniel: "daniel", Hosea: "oseas", Joel: "joel",
  Amos: "amós", Obadiah: "abdías", Jonah: "jonás", Micah: "miqueas",
  Nahum: "nahúm", Habakkuk: "habacuc", Zephaniah: "sofonías", Haggai: "hageo",
  Zechariah: "zacarías", Malachi: "malaquías", Matthew: "sanmateo",
  Mark: "sanmarcos", Luke: "sanlucas", John: "sanjuan", Acts: "hechos",
  Romans: "romanos", "1 Corinthians": "1corintios", "2 Corinthians": "2corintios",
  Galatians: "gálatas", Ephesians: "efesios", Philippians: "filipenses",
  Colossians: "colosenses", "1 Thessalonians": "1tesalonicenses",
  "2 Thessalonians": "2tesalonicenses", "1 Timothy": "1timoteo",
  "2 Timothy": "2timoteo", Titus: "tito", Philemon: "filemón",
  Hebrews: "hebreos", James: "santiago", "1 Peter": "1pedro", "2 Peter": "2pedro",
  "1 John": "1juan", "2 John": "2juan", "3 John": "3juan", Jude: "judas",
  Revelation: "apocalipsis",
}

function bookNameFor(translationId: string, book: string): string {
  if (translationId === "rvr1960") {
    return SPANISH_BOOK_MAP[book] || book.toLowerCase()
  }
  return book.toLowerCase()
}

function getWldehId(translationId: string): string | null {
  // Direct wldeh mapping
  if (WLDEH_MAP[translationId]) return WLDEH_MAP[translationId]
  // Try the translation ID itself (e.g., "en-kjv")
  const direct = `en-${translationId}`
  return direct
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
  try {
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
  } catch {
    return null
  }
}

async function fetchFromWldeh(translationId: string, book: string, chapter: number): Promise<BibleChapter | null> {
  const wldehId = getWldehId(translationId)
  if (!wldehId) return null
  const bookName = bookNameFor(translationId, book)
  const url = `https://raw.githubusercontent.com/wldeh/bible-api/master/bibles/${wldehId}/books/${bookName}/chapters/${chapter}.json`
  try {
    const resp = await fetch(url, { headers: { "User-Agent": "edify-bible" } })
    if (!resp.ok) return null
    const data = await resp.json()
    return {
      book,
      chapter,
      verses: data.data.map((v: any) => ({ number: parseInt(v.verse), text: v.text })),
      translation: translationId,
    }
  } catch {
    return null
  }
}

export async function fetchChapter(
  translationId: string,
  book: string,
  chapter: number
): Promise<BibleChapter | null> {
  try {
    // Try wldeh first for translations that have it
    const wldeh = await fetchFromWldeh(translationId, book, chapter)
    if (wldeh) return wldeh

    // Try bolls.life for translations that have it
    const bolls = await fetchFromBolls(translationId, book, chapter)
    if (bolls) return bolls

    // Fall back to bible-api.com (always returns KJV text)
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
