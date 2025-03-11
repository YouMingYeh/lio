"use client";

import { GlobalDialogContainer } from "@/components/layout/global-dialog-container";
import { GlobalSheetContainer } from "@/components/layout/global-sheet-container";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { LiffProvider } from "@/hooks/use-liff";
import { UserProvider } from "@/hooks/use-user";
import { Toaster as Sonner } from "@workspace/ui/components/sonner";
import { Toaster } from "@workspace/ui/components/toaster";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import { Suspense } from "react";

/**
 * Providers component that wraps its children with various context providers.
 *
 * The Providers component includes the following providers:
 * - ThemeProvider: Manages theme settings with options for class attribute, default theme, system theme, and color scheme.
 * - Toaster: Provides toast notifications.
 * - Sonner: Provides additional notifications.
 * - GlobalSheetContainer: Manages global sheet components.
 * - GlobalDialogContainer: Manages global dialog components.
 * - PostHogProvider: Provides PostHog analytics.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableColorScheme>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <GlobalSheetContainer />
        <GlobalDialogContainer />
        <Suspense>
          <LiffProvider>
            <UserProvider>{children}</UserProvider>
          </LiffProvider>
        </Suspense>
      </TooltipProvider>
    </ThemeProvider>
  );
}
