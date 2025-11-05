"use client"

import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react"

interface DatePickerProps {
  label: string
  id?: string
  value?: Date | string
  onChange: (date: Date | undefined) => void
}

export function DatePicker({ label, id, value, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const date = value ? (typeof value === "string" ? new Date(value) : value) : undefined
  const htmlId = id || `date-picker-${label.toLowerCase().replace(/ /g, '-')}`

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={htmlId} className="px-1">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={htmlId}
            className="w-48 justify-between font-normal"
          >
            {date ? date.toLocaleDateString() : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(date) => {
              onChange(date)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
