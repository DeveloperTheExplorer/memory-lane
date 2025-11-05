"use client"

import * as React from "react"

import { Calendar } from "@/components/ui/calendar"
import dayjs from "dayjs"

export default function Calendar01() {
  const [date, setDate] = React.useState<Date | undefined>(
    dayjs("2025-06-12").toDate()
  )

  return (
    <Calendar
      mode="single"
      defaultMonth={date}
      selected={date}
      onSelect={setDate}
      className="rounded-lg border shadow-sm"
    />
  )
}
