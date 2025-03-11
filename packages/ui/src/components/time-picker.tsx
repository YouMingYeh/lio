"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";
import { Clock } from "lucide-react";
import * as React from "react";

interface TimePickerProps {
  date: Date;
  setDate: (date: Date) => void;
  className?: string;
}

export function TimePicker({ date, setDate, className }: TimePickerProps) {
  const minutesList = Array.from({ length: 60 }, (_, i) => i);
  const hoursList = Array.from({ length: 24 }, (_, i) => i);

  const handleHourChange = (hour: string) => {
    const newDate = new Date(date);
    newDate.setHours(parseInt(hour));
    setDate(newDate);
  };

  const handleMinuteChange = (minute: string) => {
    const newDate = new Date(date);
    newDate.setMinutes(parseInt(minute));
    setDate(newDate);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Clock className="h-4 w-4 text-muted-foreground" />
      <Select
        value={date.getHours().toString()}
        onValueChange={handleHourChange}
      >
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {hoursList.map((hour) => (
            <SelectItem key={hour} value={hour.toString()}>
              {hour.toString()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground">:</span>
      <Select
        value={date.getMinutes().toString()}
        onValueChange={handleMinuteChange}
      >
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="Minute" />
        </SelectTrigger>
        <SelectContent>
          {minutesList.map((minute) => (
            <SelectItem key={minute} value={minute.toString()}>
              {minute.toString()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
