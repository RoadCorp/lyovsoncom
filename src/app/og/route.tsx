import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { OG_PARAM_LIMITS, sanitizeOgParam } from "@/utilities/og-image";
import {
  DEFAULT_OPEN_GRAPH_IMAGE_HEIGHT,
  DEFAULT_OPEN_GRAPH_IMAGE_WIDTH,
} from "@/utilities/seo-metadata";

const CACHE_CONTROL =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

interface OgAssets {
  crestDataUri: string;
  monoFont: ArrayBuffer;
  serifFont: ArrayBuffer;
}

let cachedAssetsPromise: Promise<OgAssets> | null = null;

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  const copy = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(copy).set(buffer);
  return copy;
}

function loadOgAssets(): Promise<OgAssets> {
  if (!cachedAssetsPromise) {
    const root = process.cwd();
    cachedAssetsPromise = Promise.all([
      readFile(
        path.join(root, "src/app/og/fonts/ibm-plex-serif-600-latin.ttf")
      ),
      readFile(path.join(root, "src/app/og/fonts/ibm-plex-mono-500-latin.ttf")),
      readFile(path.join(root, "public/brand/lyovson-crest-mark-white.png")),
    ]).then(([serifBuffer, monoBuffer, crestBuffer]) => ({
      serifFont: toArrayBuffer(serifBuffer),
      monoFont: toArrayBuffer(monoBuffer),
      crestDataUri: `data:image/png;base64,${crestBuffer.toString("base64")}`,
    }));
  }

  return cachedAssetsPromise;
}

function getTitleFontSize(title: string): number {
  if (title.length > 72) {
    return 44;
  }
  if (title.length > 42) {
    return 54;
  }
  return 64;
}

function CornerFlourish({
  bottom,
  left,
  right,
  rotate,
  top,
}: {
  bottom?: number;
  left?: number;
  right?: number;
  rotate: number;
  top?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="32"
      style={{
        position: "absolute",
        ...(top === undefined ? {} : { top }),
        ...(right === undefined ? {} : { right }),
        ...(bottom === undefined ? {} : { bottom }),
        ...(left === undefined ? {} : { left }),
        transform: `rotate(${rotate}deg)`,
      }}
      viewBox="0 0 32 32"
      width="32"
    >
      <path
        d="M2 24V2H24M2 9C9 9 13 5 13 2M9 2C9 9 5 13 2 13"
        stroke="#cdaa80"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.65"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title =
    sanitizeOgParam(searchParams.get("title"), OG_PARAM_LIMITS.title) ||
    "Lyóvson.com";
  const eyebrow =
    sanitizeOgParam(searchParams.get("eyebrow"), OG_PARAM_LIMITS.eyebrow) ||
    "Writing & Archive";
  const meta =
    sanitizeOgParam(searchParams.get("meta"), OG_PARAM_LIMITS.meta) ||
    "Rafa & Jess Lyóvson";

  const { crestDataUri, monoFont, serifFont } = await loadOgAssets();
  const titleFontSize = getTitleFontSize(title);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: "#0e0911",
        backgroundImage:
          "radial-gradient(circle at 22% 18%, rgba(124, 71, 98, 0.36), transparent 56%), radial-gradient(circle at 84% 82%, rgba(205, 170, 128, 0.16), transparent 52%)",
        color: "#f4ecda",
        padding: "56px 68px",
        fontFamily: "IBM Plex Serif",
      }}
    >
      {/* Outer archival hairline frame */}
      <div
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          bottom: 24,
          left: 24,
          border: "1px solid rgba(205, 170, 128, 0.32)",
          borderRadius: 16,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 34,
          right: 34,
          bottom: 34,
          left: 34,
          border: "1px solid rgba(205, 170, 128, 0.14)",
          borderRadius: 10,
          display: "flex",
        }}
      />

      <CornerFlourish left={42} rotate={0} top={42} />
      <CornerFlourish right={42} rotate={90} top={42} />
      <CornerFlourish bottom={42} right={42} rotate={180} />
      <CornerFlourish bottom={42} left={42} rotate={270} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "20px 24px",
        }}
      >
        {/* Top brand bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <svg
              aria-hidden="true"
              fill="none"
              height="14"
              viewBox="0 0 16 16"
              width="14"
            >
              <path
                d="M8 2L14 8L8 14L2 8Z"
                stroke="#cdaa80"
                strokeWidth="1.65"
              />
              <circle cx="8" cy="8" fill="#cdaa80" r="1.6" />
            </svg>
            <div
              style={{
                fontFamily: "IBM Plex Mono",
                fontSize: 20,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#cdaa80",
              }}
            >
              {eyebrow}
            </div>
          </div>

          {/* biome-ignore lint/performance/noImgElement: next/og ImageResponse (Satori) requires native <img> elements */}
          <img
            alt=""
            height={112}
            src={crestDataUri}
            style={{
              objectFit: "contain",
              opacity: 0.94,
            }}
            width={112}
          />
        </div>

        {/* Centerpiece title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            paddingTop: 12,
            paddingBottom: 12,
            paddingRight: 28,
          }}
        >
          <div
            style={{
              fontFamily: "IBM Plex Serif",
              fontSize: titleFontSize,
              fontWeight: 600,
              lineHeight: 1.14,
              letterSpacing: "-0.02em",
              color: "#f4ecda",
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer colophon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: 22,
            borderTop: "1px solid rgba(205, 170, 128, 0.28)",
          }}
        >
          <div
            style={{
              fontFamily: "IBM Plex Mono",
              fontSize: 19,
              letterSpacing: "0.08em",
              color: "#d8aeb6",
            }}
          >
            {meta}
          </div>
          <div
            style={{
              fontFamily: "IBM Plex Mono",
              fontSize: 19,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#cdaa80",
            }}
          >
            LYÓVSON.COM
          </div>
        </div>
      </div>
    </div>,
    {
      width: DEFAULT_OPEN_GRAPH_IMAGE_WIDTH,
      height: DEFAULT_OPEN_GRAPH_IMAGE_HEIGHT,
      headers: {
        "Cache-Control": CACHE_CONTROL,
      },
      fonts: [
        {
          name: "IBM Plex Serif",
          data: serifFont,
          style: "normal",
          weight: 600,
        },
        {
          name: "IBM Plex Mono",
          data: monoFont,
          style: "normal",
          weight: 500,
        },
      ],
    }
  );
}
