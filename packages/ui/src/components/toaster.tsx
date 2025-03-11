"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@workspace/ui/components/toast";
import { ToastProgress } from "@workspace/ui/components/toast-progress";
import { useToast } from "@workspace/ui/hooks/use-toast";
import { useState } from "react";

export function Toaster() {
  const { toasts } = useToast();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast
            key={id}
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...props}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
            <ToastProgress
              duration={props.duration || 2000}
              isHovered={isHovered}
            />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
