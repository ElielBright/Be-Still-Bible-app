import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export function getTodayVerse(): { reference: string; text: string } {
  const verses = [
    { reference: "Philippians 4:13", text: "I can do all things through Christ who strengthens me." },
    { reference: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope." },
    { reference: "Psalm 23:1", text: "The Lord is my shepherd; I shall not want." },
    { reference: "Isaiah 40:31", text: "But those who wait on the Lord shall renew their strength; they shall mount up with wings like eagles." },
    { reference: "Joshua 1:9", text: "Be strong and of good courage; do not be afraid, nor be dismayed, for the Lord your God is with you wherever you go." },
    { reference: "Romans 8:28", text: "And we know that all things work together for good to those who love God, to those who are called according to His purpose." },
    { reference: "2 Corinthians 5:17", text: "Therefore, if anyone is in Christ, he is a new creation; old things have passed away; behold, all things have become new." },
  ]
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return verses[dayOfYear % verses.length]
}
