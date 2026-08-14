import type { MetadataRoute } from "next";

// Placeholder monogram icon — swap for the real SSSVM crest assets when available (see README follow-ups).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SSSVM — Sree Siva Shankar Vidya Mandir",
    short_name: "SSSVM",
    description: "Student and parent portal for Sree Siva Shankar Vidya Mandir, K.R.M. Colony.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#1e3a8a",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
