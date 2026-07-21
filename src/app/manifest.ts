import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: "GYW",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#08080C",
    theme_color: "#08080C",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
