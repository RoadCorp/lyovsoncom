import config from "@payload-config";
import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload, type User } from "payload";
import { type ReactNode, Suspense } from "react";
import { isLyovson } from "@/access/is-lyovson";
import { SkeletonCard } from "@/components/grid";

/**
 * Renders its children only for a signed-in Lyovson and sends everyone
 * else to the admin login. Use it in the page itself: layouts and pages
 * render in parallel, so a layout check can't keep a page's output private.
 */
export function RequireUser({
  children,
}: {
  children: (user: User) => ReactNode;
}) {
  return (
    <Suspense fallback={<SkeletonCard />}>
      <UserGate>{children}</UserGate>
    </Suspense>
  );
}

async function UserGate({ children }: { children: (user: User) => ReactNode }) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await nextHeaders() });

  if (!isLyovson(user)) {
    redirect("/admin");
  }

  return children(user);
}
