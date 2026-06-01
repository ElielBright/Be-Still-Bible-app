"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { getTodayVerse, getTimeOfDayGreeting } from "@/lib/utils"
import { getUserProfile, saveUserProfile } from "@/lib/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Headphones, MessageSquare, StickyNote, CheckCircle2, Flame } from "lucide-react"

const QUIET_TIME_STEPS = [
  { label: "Read", icon: BookOpen, href: "/bible", color: "text-blue-500" },
  { label: "Listen", icon: Headphones, href: "/sermons", color: "text-green-500" },
  { label: "Reflect", icon: MessageSquare, href: "/bible", color: "text-purple-500" },
  { label: "Journal", icon: StickyNote, href: "/notes", color: "text-yellow-500" },
]

export default function HomePage() {
  const { user } = useAuth()
  const [streak, setStreak] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const verse = getTodayVerse()
  const greeting = getTimeOfDayGreeting()

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then((profile) => {
        if (profile) setStreak(profile.streak_count || 0)
      })
    }
  }, [user])

  const toggleStep = (label: string) => {
    setCompletedSteps((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}, {user?.displayName?.split(" ")[0] || "Beloved"}
          </h1>
          <p className="text-muted-foreground">Start your quiet time</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border px-4 py-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <span className="font-bold">{streak}</span>
          <span className="text-xs text-muted-foreground">day streak</span>
        </div>
      </div>

      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <Link href={`/bible`} className="group flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Verse of the Day</p>
              <p className="mt-1 text-lg font-medium">&ldquo;{verse.text}&rdquo;</p>
              <p className="text-sm text-primary">{verse.reference}</p>
            </div>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
              Read chapter &rarr;
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today&apos;s Quiet Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {QUIET_TIME_STEPS.map((step) => {
              const Icon = step.icon
              const isDone = completedSteps.includes(step.label)
              return (
                <button
                  key={step.label}
                  onClick={() => toggleStep(step.label)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                    isDone ? "border-primary bg-primary/5" : "hover:bg-accent"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  ) : (
                    <Icon className={`h-6 w-6 ${step.color}`} />
                  )}
                  <span className={`text-sm font-medium ${isDone ? "text-primary" : ""}`}>
                    {step.label}
                  </span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/sermons">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardContent className="flex items-center gap-3 p-4">
              <Headphones className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Recent Sermons</p>
                <p className="text-xs text-muted-foreground">Continue where you left off</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/notes">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardContent className="flex items-center gap-3 p-4">
              <StickyNote className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">My Notes</p>
                <p className="text-xs text-muted-foreground">Review your journal entries</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
