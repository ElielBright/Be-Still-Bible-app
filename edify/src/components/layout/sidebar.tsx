"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  BookOpen,
  Search,
  Library,
  StickyNote,
  Settings,
  LogOut,
  Cross,
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/bible", label: "Bible", icon: BookOpen },
  { href: "/sermons", label: "Sermons", icon: Search },
  { href: "/library", label: "Library", icon: Library },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex items-center gap-2 border-b px-6 py-5">
        <Cross className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">Edify</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {user?.displayName?.[0] || user?.email?.[0] || "U"}
          </div>
          <div className="flex-1 truncate text-sm font-medium">
            {user?.displayName || user?.email || "User"}
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
