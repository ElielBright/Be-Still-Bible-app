"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, BellOff } from "lucide-react"
import { getFirebaseMessaging } from "@/lib/firebase"
import { getToken, onMessage } from "firebase/messaging"

interface NotificationSetupProps {
  onStatusChange: (enabled: boolean) => void
}

export function NotificationSetup({ onStatusChange }: NotificationSetupProps) {
  const [enabled, setEnabled] = useState(false)
  const [time, setTime] = useState("06:00")

  useEffect(() => {
    const saved = localStorage.getItem("edify-notifications-enabled")
    const savedTime = localStorage.getItem("edify-notification-time")
    if (saved === "true") setEnabled(true)
    if (savedTime) setTime(savedTime)
  }, [])

  const requestPermission = async () => {
    try {
      const messaging = await getFirebaseMessaging()
      if (!messaging) return

      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
        })
        localStorage.setItem("edify-notifications-enabled", "true")
        localStorage.setItem("edify-fcm-token", token)
        setEnabled(true)
        onStatusChange(true)
      }
    } catch {
      console.error("Notification permission denied")
    }
  }

  const disable = () => {
    localStorage.setItem("edify-notifications-enabled", "false")
    setEnabled(false)
    onStatusChange(false)
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={enabled ? "default" : "outline"}
        size="sm"
        onClick={enabled ? disable : requestPermission}
        className="gap-2"
      >
        {enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        {enabled ? "Notifications On" : "Enable Notifications"}
      </Button>
      {enabled && (
        <input
          type="time"
          value={time}
          onChange={(e) => {
            setTime(e.target.value)
            localStorage.setItem("edify-notification-time", e.target.value)
          }}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
        />
      )}
    </div>
  )
}
