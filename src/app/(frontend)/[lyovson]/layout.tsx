import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GridCardUser } from "@/components/grid";
import { ProfileSkeleton } from "@/components/grid/skeleton/profile-skeleton";
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

async function AuthorLayout({ children, params }: LayoutProps) {
  const { lyovson: username } = await params;

  const lyovson = await getLyovsonProfile(username);

  if (!lyovson) {
    return notFound();
  }

  const fontClass = fontMap[lyovson.font || "sans"] || "font-sans";

  return (
    <div className={`contents ${fontClass}`}>
      <GridCardUser user={lyovson} />
      {children}
    </div>
  );
}

export default function Layout(props: LayoutProps) {
  return (
    <Suspense
      fallback={
        <>
          <ProfileSkeleton />
          {props.children}
        </>
      }
    >
      <AuthorLayout {...props} />
    </Suspense>
  );
}
