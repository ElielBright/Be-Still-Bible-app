"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

const DEFAULT_PREACHERS = [
  "Dag Heward-Mills",
  "Benny Hinn",
  "Duncan Williams",
  "Joshua Selman",
  "Myles Monroe",
]

interface PreacherSelectorProps {
  selected: string[]
  onChange: (preachers: string[]) => void
}

export function PreacherSelector({ selected, onChange }: PreacherSelectorProps) {
  const [search, setSearch] = useState("")

  const togglePreacher = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((p) => p !== name))
    } else {
      onChange([...selected, name])
    }
  }

  const filteredDefaults = DEFAULT_PREACHERS.filter(
    (p) => p.toLowerCase().includes(search.toLowerCase()) && !selected.includes(p)
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {selected.map((preacher) => (
          <Badge key={preacher} variant="secondary" className="gap-1">
            {preacher}
            <button onClick={() => togglePreacher(preacher)}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Search preachers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && !DEFAULT_PREACHERS.includes(search) && (
          <Button size="sm" variant="outline" onClick={() => { togglePreacher(search); setSearch("") }}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        )}
      </div>

      {search && filteredDefaults.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filteredDefaults.map((p) => (
            <Badge key={p} variant="outline" className="cursor-pointer" onClick={() => togglePreacher(p)}>
              <Plus className="h-3 w-3 mr-1" /> {p}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
