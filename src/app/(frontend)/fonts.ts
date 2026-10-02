import localFont from "next/font/local";
import { cn } from "@/lib/utils";

// Shared by the root layout and app/global-not-found.tsx, which renders its
// own <html> outside the layout.

const fontMono = localFont({
  src: [
    {
      path: "./fonts/ibm-plex-mono-400-latin.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/ibm-plex-mono-500-latin.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/ibm-plex-mono-600-latin.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-mono",
  display: "swap",
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "Monaco",
    "Consolas",
    "Liberation Mono",
    "Courier New",
    "monospace",
  ],
  // Labels and code only; not worth three preloads on every page.
  preload: false,
});

const fontSerif = localFont({
  src: [
    {
      path: "./fonts/ibm-plex-serif-400-latin.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/ibm-plex-serif-500-latin.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/ibm-plex-serif-600-latin.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-serif",
  display: "swap",
  fallback: [
    "ui-serif",
    "Georgia",
    "Cambria",
    "Times New Roman",
    "Times",
    "serif",
  ],
  preload: false,
});

// Display face for titles and headings: only Plex Serif 600, preloaded
// because it is above the fold. Declared for 600–700 so `font-bold` uses
// this file instead of synthesizing bold from it.
const fontDisplay = localFont({
  src: "./fonts/ibm-plex-serif-600-latin.woff2",
  weight: "600 700",
  style: "normal",
  variable: "--font-display",
  display: "swap",
  fallback: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "serif"],
  preload: true,
});

// IBM Plex Sans ships as one variable file (weights 100–700). Declaring it
// once loads it once and gives real bold instead of synthesized weights.
const fontSans = localFont({
  src: "./fonts/ibm-plex-sans-variable-latin.woff2",
  weight: "100 700",
  style: "normal",
  variable: "--font-sans",
  display: "swap",
  fallback: [
    "ui-sans-serif",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
  preload: true,
});

export const fontVariables = cn(
  fontMono.variable,
  fontSerif.variable,
  fontDisplay.variable,
  fontSans.variable
);
