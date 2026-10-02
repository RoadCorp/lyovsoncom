import type { Metadata } from "next";
import type React from "react";
import { getServerSideURL } from "@/utilities/get-url";

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  icons: [
    { rel: "icon", type: "image/x-icon", url: "/favicon.ico" },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: "/favicon-16x16.png",
    },
    {
      rel: "apple-touch-icon",
      type: "image/png",
      url: "/apple-touch-icon.png",
    },
  ],
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
