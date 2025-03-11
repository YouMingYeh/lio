import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// The client you created from the Server-Side Auth instructions

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      const dashboardPath = joinUrl(next, "dashboard");
      if (isLocalEnv) {
        // Use origin (which already includes protocol) for local
        console.log("redirecting to", joinUrl(origin, dashboardPath));
        return redirect(joinUrl(origin, dashboardPath));
      } else if (forwardedHost) {
        // Prepend https:// for production if forwardedHost is available
        console.log(
          "redirecting to",
          `https://${joinUrl(forwardedHost, dashboardPath)}`,
        );
        return redirect(`https://${joinUrl(forwardedHost, dashboardPath)}`);
      } else {
        console.log("redirecting to", joinUrl(origin, dashboardPath));
        return redirect(joinUrl(origin, dashboardPath));
      }
    }
  }
  // return the user to an error page with instructions
  return redirect(joinUrl(origin, "/auth/auth-code-error"));
}

// Helper to join URL parts without duplicate slashes
function joinUrl(...parts: string[]): string {
  return parts
    .map((part, index) =>
      index === 0 ? part.replace(/\/+$/, "") : part.replace(/^\/+|\/+$/g, ""),
    )
    .join("/");
}
