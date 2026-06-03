import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { token, title, body } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Missing FCM token" }, { status: 400 })
    }

    const message = {
      to: token,
      notification: {
        title: title || "Edify - Daily Verse",
        body: body || "Time for your daily quiet time",
      },
    }

    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${process.env.FCM_SERVER_KEY}`,
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "FCM send failed" }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
