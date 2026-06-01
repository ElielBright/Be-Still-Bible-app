"use client"

import { useAuth } from "@/lib/auth"
import { NotificationSetup } from "@/components/notifications/notification-setup"
import { BIBLE_TRANSLATIONS } from "@/lib/bible-api"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserProfile, saveUserProfile } from "@/lib/firestore"
import { useState, useEffect } from "react"

export default function SettingsPage() {
  const { user } = useAuth()
  const [translation, setTranslation] = useState("de4e12af7f28f599-01")

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then((profile) => {
        if (profile?.preferred_translation) setTranslation(profile.preferred_translation)
      })
    }
  }, [user])

  const handleTranslationChange = async (value: string) => {
    setTranslation(value)
    if (user) {
      await saveUserProfile(user.uid, { preferred_translation: value })
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
              {user?.displayName?.[0] || user?.email?.[0] || "U"}
            </div>
            <div>
              <p className="font-medium">{user?.displayName || "User"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bible Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="mb-1 block text-sm font-medium">Preferred Translation</label>
          <Select
            value={translation}
            onValueChange={handleTranslationChange}
            options={BIBLE_TRANSLATIONS.map((t) => ({ value: t.id, label: `${t.code} - ${t.name}` }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationSetup onStatusChange={() => {}} />
        </CardContent>
      </Card>
    </div>
  )
}
