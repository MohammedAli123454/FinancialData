"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";

interface CalendarFieldProps {
  label: string;
  value: Date | undefined | null;
  onChange: (date: Date | undefined) => void; 
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
}

export default function CalendarField({
  label,
  value,
  onChange,
  error,
  disabled = false,
  placeholder = "Pick date",
  minYear = 2020,
  maxYear = new Date().getFullYear(),
}: CalendarFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <input
          type="text"
          className="w-full px-3 py-2 border rounded cursor-pointer bg-white"
          value={value ? format(value, "yyyy-MM-dd") : ""}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          onClick={() => !disabled && setOpen((o) => !o)}
        />
       {open && (
  <div className="absolute z-50 mt-1 bg-white border rounded shadow-lg">
    <DayPicker
      mode="single"
      selected={value ? new Date(value) : undefined}
      onSelect={(date) => {
        onChange(date);
        setOpen(false);
      }}
      showOutsideDays
      captionLayout="dropdown-buttons"
      fromYear={minYear}
      toYear={maxYear}
    />
  </div>
)}

      </div>
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    </div>
  );
}
