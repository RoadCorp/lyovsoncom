import Image from "next/image";
import "./crest.css";

// Both crests render and CSS shows the one for the admin's data-theme:
// Payload 4's useTheme() reports "light" while the OS-driven auto theme is
// dark, and CSS also avoids a flash on first paint.
export function Crest() {
  return (
    <>
      <Image
        alt="Lyovson.com Logo"
        className="admin-crest admin-crest--on-light"
        height={200}
        src="/crest-dark-simple.webp"
        width={200}
      />
      <Image
        alt=""
        aria-hidden
        className="admin-crest admin-crest--on-dark"
        height={200}
        src="/crest-light-simple.webp"
        width={200}
      />
    </>
  );
}
