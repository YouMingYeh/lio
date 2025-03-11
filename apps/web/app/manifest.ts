import type { MetadataRoute } from "next";

/**
 * For PWA support, you can define a manifest file that provides metadata about the web application. The manifest file is a JSON file that contains information about the web application, such as its name, author, icon, and description. The manifest file is used by the browser to install the web application to the home screen of a device.
 * @see https://nextjs.org/docs/app/building-your-application/configuring/progressive-web-apps
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Adastra",
    short_name: "Adastra",
    description: "Adastra 活動管理系統",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
