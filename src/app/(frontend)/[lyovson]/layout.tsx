import { notFound } from "next/navigation";
import { GridCardLyovsonSections, GridCardUser } from "@/components/grid";
import { getLyovsonProfile } from "@/utilities/get-lyovson-profile";
import { getLyovsonStaticParams } from "./_utilities/staticParams";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ lyovson: string }>;
}

type FontClass = "font-sans" | "font-serif" | "font-mono";

const fontMap: Record<string, FontClass> = {
  sans: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
};

export async function generateStaticParams() {
  return getLyovsonStaticParams();
}

export default async function Layout({ children, params }: LayoutProps) {
  const { lyovson: username } = await params;

  const lyovson = await getLyovsonProfile(username);

  if (!lyovson) {
    return notFound();
  }

  const fontClass = fontMap[lyovson.font || "sans"] || "font-sans";

  return (
    <div className={`contents ${fontClass}`}>
      <GridCardLyovsonSections username={username} />
      <GridCardUser
        className="g2:row-start-1 g3:row-start-1 row-start-3 g2:row-end-3 g3:row-end-2 row-end-5"
        user={lyovson}
      />
      {children}
    </div>
  );
}
