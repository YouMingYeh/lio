import type { MetadataRoute } from "next";

/**
 * Generates the robots.txt configuration for the website.
 *
 * The configuration includes:
 * - `rules`: Specifies the rules for web crawlers.
 *   - `userAgent`: The user agent for which the rules apply. In this case, it applies to all user agents ("*").
 *   - `allow`: An array of paths that are allowed to be crawled. Here, it includes the root ("/") and "/home".
 * - `sitemap`: The URL to the sitemap of the website.
 *
 * For more information on robots.txt, refer to the Next.js documentation:
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/privacy", "/terms"],
    },
    sitemap: "https://lio.adastra.tw/sitemap.xml",
  };
}
