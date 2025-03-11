"use client";

import { X } from "lucide-react";
import { useState } from "react";

interface SiteBannerProps {
  message: string;
  className?: string;
}

export function SiteBanner({ message, className = "" }: SiteBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`relative w-full bg-primary px-4 py-3 text-center text-primary-foreground ${className}`}
    >
      <p className="mx-auto max-w-4xl text-sm font-medium md:text-base">
        {message}
      </p>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-primary-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary-foreground/20"
        aria-label="Close banner"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
