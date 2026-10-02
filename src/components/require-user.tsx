import config from "@payload-config";
import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload, type TypedUser } from "payload";
import { type ReactNode, Suspense } from "react";
import { SkeletonCard } from "@/components/grid";

/**
 * Renders its children only for a signed-in Payload user and sends everyone
 * else to the admin login. Use it in the page itself: layouts and pages
 * render in parallel, so a layout check can't keep a page's output private.
 */
export function RequireUser({
  children,
}: {
  children: (user: TypedUser) => ReactNode;
}) {
  return (
    <Suspense fallback={<SkeletonCard />}>
      <UserGate>{children}</UserGate>
    </Suspense>
  );
}

async function UserGate({
  children,
}: {
  children: (user: TypedUser) => ReactNode;
}) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await nextHeaders() });

  if (!user) {
    redirect("/admin");
  }

  return children(user);
}
