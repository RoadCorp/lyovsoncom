import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function isLocalHost(host: string | null) {
  if (!host) {
    return false;
  }

  return (
    host === "localhost" ||
    host.startsWith("localhost:") ||
    host === "127.0.0.1" ||
    host.startsWith("127.0.0.1:")
  );
}

function isHtmlNavigation(request: NextRequest) {
  const accept = request.headers.get("accept");

  return Boolean(accept?.includes("text/html"));
}

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  if (isLocalHost(request.headers.get("host")) && isHtmlNavigation(request)) {
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api|.*\\..*).*)"],
};
