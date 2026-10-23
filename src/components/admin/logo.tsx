import { Crest } from "./crest";

export default function AdminLogo() {
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
        Lyovson.com
      </span>
    </div>
  );
}
