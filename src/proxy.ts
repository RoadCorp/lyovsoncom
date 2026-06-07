import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  getRequestUserAgent,
  isHostileProbePath,
  shouldBlockExpensiveBotRequest,
} from "@/utilities/request-guards";

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
  const { pathname } = request.nextUrl;
  const userAgent = getRequestUserAgent(request.headers);

  if (
    isHostileProbePath(pathname) ||
    shouldBlockExpensiveBotRequest(pathname, userAgent)
  ) {
    return new NextResponse("Forbidden", {
      status: 403,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  }

  const response = NextResponse.next();

  if (isLocalHost(request.headers.get("host")) && isHtmlNavigation(request)) {
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/_next/image",
    "/.env",
    "/:path*/.env",
    "/.git/:path*",
    "/wp-:path*",
    "/xmlrpc.php",
    "/((?!_next/static|.*\\.(?:avif|css|gif|ico|jpg|jpeg|js|json|map|png|svg|txt|webmanifest|webp|woff|woff2)$).*)",
  ],
};
