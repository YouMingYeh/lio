"use client";

import { Button } from "@workspace/ui/components/button";
import { AlertCircle } from "lucide-react";

/**
 * The GlobalError component displays an error page when an unexpected error occurs. The component includes a message indicating that an error occurred and provides a button to retry the operation.
 *
 * For more information on error pages, refer to the Next.js documentation:
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh">
      <body className="bg-background text-foreground flex h-screen w-full flex-col items-center justify-center">
        <main className="container max-w-md px-4">
          <div className="bg-card rounded-lg border p-8 shadow-lg">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle
                className="text-destructive h-12 w-12"
                aria-hidden="true"
              />
              <h1 className="text-3xl font-bold tracking-tight">出錯了！</h1>
              <p className="text-muted-foreground">
                很抱歉，發生了意外錯誤。我們的團隊已經收到通知，並正在努力解決這個問題。
              </p>
              {error.message && (
                <div className="bg-muted w-full overflow-hidden rounded border p-4">
                  <pre className="whitespace-pre-wrap break-words text-sm">
                    <code>{error.message}</code>
                  </pre>
                </div>
              )}
              <div className="flex gap-4">
                <Button onClick={() => reset()} variant="default">
                  重試
                </Button>
                <Button
                  onClick={() => (window.location.href = "/")}
                  variant="outline"
                >
                  返回首頁
                </Button>
              </div>
              {error.digest && (
                <p className="text-muted-foreground text-xs">
                  錯誤代碼：{error.digest}
                </p>
              )}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
