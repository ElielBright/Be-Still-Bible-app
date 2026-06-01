import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Edify - Bible Study Companion",
  description: "A distraction-free Bible study companion that connects scripture to sermons, books, and Spirit-led insight.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Edify - Bible Study Companion",
    description: "Scripture. Sermons. Insight. All in one place.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
