"use client";

import * as React from "react";

const Chart = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div className="relative" ref={ref} {...props} />
));
Chart.displayName = "Chart";

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div className="relative" ref={ref} {...props} />
));
ChartContainer.displayName = "ChartContainer";

const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className="flex flex-wrap items-center justify-center gap-2 pt-4"
    ref={ref}
    {...props}
  />
));
ChartLegend.displayName = "ChartLegend";

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className="pointer-events-none absolute z-50 hidden h-auto w-auto rounded-md border bg-popover p-4 text-popover-foreground shadow-sm data-[state=open]:block"
    ref={ref}
    {...props}
  />
));
ChartTooltip.displayName = "ChartTooltip";

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => <div ref={ref} {...props} />);
ChartTooltipContent.displayName = "ChartTooltipContent";

const ChartTooltipItem = React.forwardRef<
  HTMLDivElement,
  {
    label: string;
    value: string;
    color: string;
  } & React.HTMLAttributes<HTMLDivElement>
>(({ label, value, color }, ref) => (
  <div className="flex items-center gap-2" ref={ref}>
    <span
      className="block h-2 w-2 rounded-full"
      style={{ backgroundColor: color }}
    />
    <span>
      {label}: {value}
    </span>
  </div>
));
ChartTooltipItem.displayName = "ChartTooltipItem";

export {
  Chart,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  ChartTooltipItem,
};
