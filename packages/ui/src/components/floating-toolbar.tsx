"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

type Side = "left" | "right";

interface FloatingToolbarContextValue {
  side: Side;
}

const FloatingToolbarContext = React.createContext<
  FloatingToolbarContextValue | undefined
>(undefined);

interface FloatingToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: Side;
  children: React.ReactNode;
}

const FloatingToolbar = React.forwardRef<HTMLDivElement, FloatingToolbarProps>(
  ({ side = "right", className, children, ...props }, ref) => {
    return (
      <FloatingToolbarContext.Provider value={{ side }}>
        <TooltipProvider>
          <div
            ref={ref}
            className={cn(
              "bg-background z-49 absolute top-1/2 -translate-y-1/2 rounded-lg border opacity-70 shadow-lg transition-all hover:opacity-100",
              side === "left" ? "left-4" : "right-4",
              className,
            )}
            {...props}
          >
            <div className="flex flex-col items-center gap-2 p-2">
              {children}
            </div>
          </div>
        </TooltipProvider>
      </FloatingToolbarContext.Provider>
    );
  },
);
FloatingToolbar.displayName = "FloatingToolbar";

interface FloatingToolbarItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ElementType;
  label: string;
}

const FloatingToolbarItem = React.forwardRef<
  HTMLButtonElement,
  FloatingToolbarItemProps
>(({ icon: Icon, label, className, ...props }, ref) => {
  const context = React.useContext(FloatingToolbarContext);
  if (!context) {
    throw new Error(
      "FloatingToolbarItem must be used within a FloatingToolbar",
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          ref={ref}
          className={cn(
            "hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50",
            className,
          )}
          {...props}
        >
          <Icon className="h-5 w-5" />
          <span className="sr-only">{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side={context.side === "left" ? "right" : "left"}>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
});
FloatingToolbarItem.displayName = "FloatingToolbarItem";

export { FloatingToolbar, FloatingToolbarItem };
