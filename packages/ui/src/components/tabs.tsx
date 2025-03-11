"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";
import { useEffect, useRef, useState } from "react";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: "default" | "underline";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });
  const tabsListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateIndicator = () => {
      if (tabsListRef.current) {
        const activeTab = tabsListRef.current.querySelector<HTMLElement>(
          '[data-state="active"]',
        );

        if (activeTab) {
          const activeRect = activeTab.getBoundingClientRect();
          const tabsRect = tabsListRef.current.getBoundingClientRect();
          setIndicatorStyle({
            left: activeRect.left - tabsRect.left,
            top:
              variant === "underline"
                ? activeRect.height - 2
                : activeRect.top - tabsRect.top,
            width: activeRect.width,
            height: variant === "underline" ? 2 : activeRect.height,
          });
        }
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    const observer = new MutationObserver(updateIndicator);
    if (tabsListRef.current) {
      observer.observe(tabsListRef.current, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }
    return () => {
      window.removeEventListener("resize", updateIndicator);
      observer.disconnect();
    };
  }, [variant]);

  return (
    <div className={"relative"} ref={tabsListRef}>
      <TabsPrimitive.List
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center",
          variant === "default" &&
            "bg-muted text-muted-foreground gap-2 rounded-md p-1",
          variant === "underline" && "text-muted-foreground space-x-4",
          className,
        )}
        {...props}
      />
      <div className={cn(variant === "underline" && "mt-2 w-full border-t")} />
      <div
        className={cn(
          "absolute transition-all duration-300 ease-in-out",
          variant === "default" && "bg-background rounded-md shadow-sm",
          variant === "underline" && "bg-primary mt-2",
        )}
        style={indicatorStyle}
      />
    </div>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: "default" | "underline";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "ring-offset-background hover:bg-background/80 focus-visible:ring-ring data-[state=active]:text-foreground z-10 inline-flex items-center justify-center whitespace-nowrap rounded text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      variant === "default" && "rounded-sm px-3 py-1.5",
      variant === "underline" && "hover:bg-muted rounded-sm px-3 py-1.5",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "ring-offset-background focus-visible:ring-ring mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
