import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Lyovson } from "@/payload-types";
import { getPayloadClient } from "@/utilities/payload-client";

export const getMeUser = async (
  args: { nullUserRedirect?: string; validUserRedirect?: string } = {}
): Promise<{
  token: string;
  user: Lyovson;
}> => {
  const { nullUserRedirect, validUserRedirect } = args;
  const cookieStore = await cookies();
  const token = cookieStore.get("payload-token")?.value;

  if (!token) {
    if (nullUserRedirect) {
      redirect(nullUserRedirect as never);
    }

    throw new Error("Authentication token not found");
  }

  const nextHeaders = new Headers(await headers());
  nextHeaders.set("authorization", `JWT ${token}`);

  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: nextHeaders });

  if (validUserRedirect && user) {
    redirect(validUserRedirect as never);
  }

  if (nullUserRedirect && !user) {
    redirect(nullUserRedirect as never);
  }

  if (!user) {
    throw new Error("Authenticated user not found");
  }

  return {
    token,
    user: user as Lyovson,
  };
};
