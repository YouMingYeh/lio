import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-nowrap",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        planning: "bg-yellow-100 text-yellow-500 border-none",
        "in-progress": "bg-blue-100 text-blue-500 border-none",
        completed: "bg-green-100 text-green-500 border-none",
        canceled: "bg-gray-100 text-gray-500 border-none",
        blue: "bg-blue-100 text-blue-500 border-none",
        green: "bg-green-100 text-green-500 border-none",
        yellow: "bg-yellow-100 text-yellow-500 border-none",
        pink: "bg-pink-100 text-pink-500 border-none",
        purple: "bg-purple-100 text-purple-500 border-none",
        red: "bg-red-100 text-red-500 border-none",
        info: "bg-blue-100 text-blue-500 border-none",
        warning: "bg-yellow-100 text-yellow-500 border-none",
        question: "bg-purple-100 text-purple-500 border-none",
        error: "bg-red-100 text-red-500 border-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
