import { notFound } from "next/navigation";
import { getActivityByDateAndSlug } from "@/utilities/get-activity";
import { absoluteUrl, activityRoute } from "@/utilities/routes";

interface Context {
  params: Promise<{ date: string; slug: string }>;
}

/**
 * Activities now live as rows on their reference's hub page. Old activity
 * URLs answer with a permanent 301 to that row; a route handler is the only
 * way to send 301 rather than Next's 308.
 */
export async function GET(_request: Request, { params }: Context) {
  const { date, slug } = await params;
  const activity = await getActivityByDateAndSlug(date, slug);
  const route = activity ? activityRoute(activity) : null;
  if (!route) {
    notFound();
  }
  return Response.redirect(absoluteUrl(route), 301);
}
