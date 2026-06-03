"use client"

import { BIBLE_TRANSLATIONS } from "@/lib/bible-api"
import { Select } from "@/components/ui/select"

interface TranslationSwitcherProps {
  value: string
  onChange: (value: string) => void
}

export function TranslationSwitcher({ value, onChange }: TranslationSwitcherProps) {
  const options = BIBLE_TRANSLATIONS.map((t) => ({
    value: t.id,
    label: `${t.code} - ${t.name}`,
  }))

  return (
    <Select
      value={value}
      onValueChange={onChange}
      options={options}
      className="w-64"
    />
  )
}
