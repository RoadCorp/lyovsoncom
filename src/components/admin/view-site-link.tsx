"use client";
import { useTheme } from "@payloadcms/ui";
import Image from "next/image";
import "./view-site-link.css";

export default function ViewSiteLink() {
  const { theme } = useTheme();
  const iconSrc =
    theme === "dark" ? "/crest-light-simple.webp" : "/crest-dark-simple.webp";

  return (
    <a
      className="view-site-link"
      href="/"
      rel="noopener noreferrer"
      target="_blank"
    >
      <Image
        alt=""
        className="view-site-link__icon"
        height={20}
        src={iconSrc}
        width={20}
      />
      <span className="view-site-link__label">View Site</span>
      <svg
        aria-hidden="true"
        className="view-site-link__external"
        fill="none"
        height="12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        viewBox="0 0 12 12"
        width="12"
      >
        <path d="M3.5 3h5.5v5.5M9 3L3 9" />
      </svg>
    </a>
  );
}
