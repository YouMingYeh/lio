import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

interface ToastProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  duration: number;
  isHovered: boolean;
}

export const ToastProgress = React.forwardRef<
  HTMLDivElement,
  ToastProgressProps
>(({ className, duration, isHovered, ...props }, ref) => {
  const [width, setWidth] = React.useState(100);

  React.useEffect(() => {
    if (isHovered) {
      return;
    }

    const timer = setInterval(() => {
      setWidth((prevWidth) => {
        if (prevWidth <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prevWidth - 100 / (duration / 100);
      });
    }, 100);

    return () => clearInterval(timer);
  }, [duration, isHovered]);

  return (
    <div
      ref={ref}
      className={cn(
        "bg-primary/20 absolute bottom-0 left-0 h-1 w-full",
        className,
      )}
      {...props}
    >
      <div
        className="bg-primary h-full transition-all duration-100 ease-linear"
        style={{ width: `${width}%` }}
      />
    </div>
  );
});
ToastProgress.displayName = "ToastProgress";
