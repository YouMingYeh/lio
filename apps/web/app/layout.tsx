import Providers from "./providers";
import "@workspace/ui/globals.css";
import { cn } from "@workspace/ui/lib/utils";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Lio",
  description: "Lio，你的 AI 英文家教",
  openGraph: {
    type: "website",
    url: "https://lio.adastra.tw",
    title: "Lio",
    description: "Lio，你的 AI 英文家教",
    images: [
      {
        url: "https://lio.adastra.tw/logo.png",
        alt: "Adastra",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lio",
    description: "Lio，你的 AI 英文家教",
    images: ["https://lio.adastra.tw/logo.png"],
  },
  keywords: [],
};

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" suppressHydrationWarning className={GeistSans.className}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={cn("flex min-h-screen")}>
        {/* Google Analytics Script */}
        <Script
          strategy="afterInteractive"
          async
          src={`https://www.googletagmanager.com/gtag/js?id=G-W6CXVXPPGS`}
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-W6CXVXPPGS');
          `}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
