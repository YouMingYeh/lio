import { getBlogPosts } from "@/lib/blog/utils";
import type { MetadataRoute } from "next";

export const baseUrl = "https://lio.adastra.tw";

/**
 * Generates a sitemap for the application.
 *
 * This function creates a sitemap by combining blog post URLs and static routes.
 * It retrieves blog posts using the `getBlogPosts` function and maps them to
 * sitemap entries with their respective URLs and last modified dates.
 * Additionally, it includes static routes and predefined URLs with their
 * respective metadata.
 *
 * For more information on sitemaps, refer to the Next.js documentation:
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const blogs = getBlogPosts().map(
    (post: { slug: any; metadata: { publishedAt: any } }) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.metadata.publishedAt,
    }),
  );

  const routes = ["", "/blog"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));
  return [
    ...blogs,
    ...routes,
    {
      url: "https://lio.adastra.tw/",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://lio.adastra.tw/home",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://lio.adastra.tw/privacy",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://lio.adastra.tw/terms",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
