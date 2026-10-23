"use client";
import { useTheme } from "@payloadcms/ui";

import Image from "next/image";

export default function AdminLogo() {
  const { theme } = useTheme();
  const logoSrc =
    theme === "dark" ? "/crest-light-simple.webp" : "/crest-dark-simple.webp";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <Image alt="Lyovson.com Logo" height={200} src={logoSrc} width={200} />
      <span
        style={{
          color: "var(--color-text)",
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: "24px",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          textAlign: "center",
        }}
      >
        Lyovson.com
      </span>
    </div>
  );
}
