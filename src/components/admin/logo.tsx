import { EternityKnot } from "@/components/ornaments";
import { Crest } from "./crest";

export default function AdminLogo() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        width: "100%",
        height: "100%",
      }}
    >
      <Crest />
      <span
        style={{
          color: "var(--color-text)",
          fontFamily: "var(--font-display)",
          fontSize: "24px",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          textAlign: "center",
        }}
      >
        Lyóvson.com
      </span>
      <div
        aria-hidden="true"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          width: "140px",
          color: "var(--color-text-tertiary)",
        }}
      >
        <span
          style={{
            flex: 1,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, var(--color-border))",
          }}
        />
        <EternityKnot size={14} />
        <span
          style={{
            flex: 1,
            height: "1px",
            background:
              "linear-gradient(90deg, var(--color-border), transparent)",
          }}
        />
      </div>
    </div>
  );
}
