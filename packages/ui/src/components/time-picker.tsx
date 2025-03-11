"use client";

import { AnimatedNumber } from "@workspace/ui/components/animated-number";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Clock } from "lucide-react";
import { useState } from "react";

export function TimePicker({ onSave }: { onSave?: (time: string) => void }) {
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const [isFlipping, setIsFlipping] = useState(false);
  const [saveScale, setSaveScale] = useState(false);

  // Format time for display
  const formattedHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const nextNotificationDatetime = new Date();
  nextNotificationDatetime.setHours(
    period === "PM" && hour !== 12 ? hour + 12 : hour,
  );
  nextNotificationDatetime.setMinutes(minute);

  if (nextNotificationDatetime < new Date()) {
    nextNotificationDatetime.setDate(nextNotificationDatetime.getDate() + 1);
  }

  // Handle hour increment/decrement
  const adjustHour = (increment: number) => {
    let newHour = hour + increment;

    // Handle hour wrapping
    if (newHour > 12) {
      newHour = 1;
    } else if (newHour < 1) {
      newHour = 12;
    }

    setHour(newHour);
  };

  // Handle minute increment/decrement
  const adjustMinute = (increment: number) => {
    let newMinute = minute + increment;

    // Handle minute wrapping
    if (newMinute >= 60) {
      newMinute = 0;
    } else if (newMinute < 0) {
      newMinute = 55;
    }

    setMinute(newMinute);
  };

  // Toggle between AM and PM with flip animation
  const togglePeriod = () => {
    setIsFlipping(true);

    setTimeout(() => {
      setPeriod(period === "AM" ? "PM" : "AM");
      setTimeout(() => {
        setIsFlipping(false);
      }, 150);
    }, 150);
  };

  // Save notification time with animation
  const saveTime = () => {
    // Convert to 24-hour format for storage
    const hour24 =
      period === "PM" && hour !== 12
        ? hour + 12
        : period === "AM" && hour === 12
          ? 0
          : hour;

    const timeString = `${hour24.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

    // Trigger save button animation
    setSaveScale(true);
    setTimeout(() => setSaveScale(false), 300);

    if (onSave) {
      onSave(timeString);
    }
    console.log("Time saved:", timeString);
  };

  return (
    <div className="w-full max-w-xs mx-auto p-4 space-y-6">
      {/* Time picker controls */}
      <div className="flex items-center justify-center gap-1">
        {/* Hour */}
        <Clock className="h-5 w-5 text-muted-foreground animate-[spin_3s_ease-in-out_infinite]" />
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full transition-transform active:scale-90"
            onClick={() => adjustHour(1)}
          >
            <span className="sr-only">Increase hour</span>
            <span className="text-lg">+</span>
          </Button>

          <div className="h-14 w-14 flex items-center justify-center overflow-hidden">
            <AnimatedNumber
              value={formattedHour}
              format={{ minimumIntegerDigits: 2 }}
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full transition-transform active:scale-90"
            onClick={() => adjustHour(-1)}
          >
            <span className="sr-only">Decrease hour</span>
            <span className="text-lg">-</span>
          </Button>
        </div>

        <div className="text-3xl font-medium opacity-70">:</div>

        {/* Minute */}
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full transition-transform active:scale-90"
            onClick={() => adjustMinute(5)}
          >
            <span className="sr-only">Increase minute</span>
            <span className="text-lg">+</span>
          </Button>

          <div className="h-14 w-14 flex items-center justify-center overflow-hidden">
            <AnimatedNumber
              value={minute}
              format={{ minimumIntegerDigits: 2 }}
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full transition-transform active:scale-90"
            onClick={() => adjustMinute(-5)}
          >
            <span className="sr-only">Decrease minute</span>
            <span className="text-lg">-</span>
          </Button>
        </div>

        {/* AM/PM with flip animation */}
        <div
          className="relative ml-2 h-14 w-14 cursor-pointer"
          onClick={togglePeriod}
        >
          <div
            className={cn(
              "absolute inset-0 w-full h-full rounded-md border border-input flex items-center justify-center transition-all duration-300 font-semibold",
              isFlipping ? "animate-flip-out" : "",
              period === "AM"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground",
            )}
          >
            {period}
          </div>
          <div
            className={cn(
              "absolute inset-0 w-full h-full rounded-md border border-input flex items-center justify-center  transition-all duration-300 font-semibold",
              isFlipping ? "animate-flip-in" : "hidden",
              period === "AM"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground",
            )}
          >
            {period === "AM" ? "PM" : "AM"}
          </div>
        </div>
      </div>

      {/* Selected time display */}
      <div className="text-center text-sm text-muted-foreground">
        下次通知您：
        {format(nextNotificationDatetime, "PPP p", { locale: zhTW })}
      </div>

      {/* Save button */}
      <Button
        className={cn(
          "w-full transition-transform duration-300",
          saveScale && "scale-95",
        )}
        onClick={saveTime}
      >
        設定
      </Button>
    </div>
  );
}
