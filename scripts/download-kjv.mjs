import { writeFileSync, mkdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, "..", "public", "bible")

const BOOKS = [
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

const CHAPTER_COUNT: Record<string, number> = {
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

async function fetchChapter(book: string, chapter: number) {
  const resp = await fetch(
    `https://bible-api.com/${encodeURIComponent(book)}+${chapter}?verse-numbers=true`
  )
  if (!resp.ok) return null
  return resp.json()
}

async function downloadKJV() {
  mkdirSync(publicDir, { recursive: true })

  const bible: Record<string, any> = {}

  for (const book of BOOKS) {
    console.log(`Downloading ${book}...`)
    bible[book] = {}
    const maxChapter = CHAPTER_COUNT[book]

    const promises = []
    for (let ch = 1; ch <= maxChapter; ch++) {
      promises.push(fetchChapter(book, ch).then((data) => ({ chapter: ch, data })))
    }

    const results = await Promise.all(promises)
    for (const result of results) {
      if (result.data) {
        const verses: Record<number, string> = {}
        for (const v of result.data.verses) {
          verses[v.verse] = v.text
        }
        bible[book][result.chapter] = verses
      }
    }
    console.log(`  Done - ${maxChapter} chapters`)
  }

  const outputPath = join(publicDir, "kjv.json")
  writeFileSync(outputPath, JSON.stringify(bible))
  console.log(`\nKJV Bible saved to ${outputPath}`)
}

downloadKJV().catch(console.error)
