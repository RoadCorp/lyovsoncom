import type { Route } from "next";
import { getCanonicalURL } from "./getURL";

interface ActivityPathInput {
  finishedAt?: string | null;
  publishedAt?: string | null;
  slug?: string | null;
  startedAt?: string | null;
}

export const UNKNOWN_ACTIVITY_DATE_SLUG = "unknown";

export const transitionTypes = {
  drillIn: "drill-in",
  postDrillIn: "post-drill-in",
  paginationNext: "pagination-next",
  paginationPrev: "pagination-prev",
  searchSubmit: "search-submit",
} as const;

export const PRIMARY_LYOVSONS = ["rafa", "jess"] as const;

export type AppTransitionType =
  (typeof transitionTypes)[keyof typeof transitionTypes];

function typedRoute<T extends string>(value: T): Route<T> {
  return value as Route<T>;
}

export function getActivityDateValue(
  activity: ActivityPathInput
): string | null {
  return (
    activity.finishedAt || activity.startedAt || activity.publishedAt || null
  );
}

export function getActivityDateSlug(activity: ActivityPathInput): string {
  const dateValue = getActivityDateValue(activity);

  if (!dateValue) {
    return UNKNOWN_ACTIVITY_DATE_SLUG;
  }

  const dateObject = new Date(dateValue);
  if (Number.isNaN(dateObject.getTime())) {
    return UNKNOWN_ACTIVITY_DATE_SLUG;
  }

  const month = String(dateObject.getMonth() + 1).padStart(2, "0");
  const day = String(dateObject.getDate()).padStart(2, "0");
  const year = String(dateObject.getFullYear()).slice(-2);

  return `${month}-${day}-${year}`;
}

export function homeRoute() {
  return typedRoute("/");
}

export function aboutRoute() {
  return typedRoute("/about");
}

export function amRoute() {
  return typedRoute("/am");
}

export function contactRoute() {
  return typedRoute("/contact");
}

export function homepageRoute(pageNumber: number) {
  return pageNumber <= 1 ? homeRoute() : typedRoute(`/page/${pageNumber}`);
}

export function postsRoute() {
  return typedRoute("/posts");
}

export function postRoute(slug: string) {
  return typedRoute(`/posts/${slug}`);
}

export function postUrl(slug: string) {
  return absoluteUrl(postRoute(slug));
}

export function postsPageRoute(pageNumber: number) {
  return pageNumber <= 1
    ? postsRoute()
    : typedRoute(`/posts/page/${pageNumber}`);
}

export function notesRoute() {
  return typedRoute("/notes");
}

export function noteRoute(slug: string) {
  return typedRoute(`/notes/${slug}`);
}

export function noteUrl(slug: string) {
  return absoluteUrl(noteRoute(slug));
}

export function notesPageRoute(pageNumber: number) {
  return pageNumber <= 1
    ? notesRoute()
    : typedRoute(`/notes/page/${pageNumber}`);
}

export function activitiesRoute() {
  return typedRoute("/activities");
}

export function activityRoute(activity: ActivityPathInput) {
  if (!activity.slug) {
    return null;
  }

  return typedRoute(
    `/activities/${getActivityDateSlug(activity)}/${activity.slug}`
  );
}

export function activityFullRoute(activity: ActivityPathInput) {
  if (!activity.slug) {
    return null;
  }

  return `${getActivityDateSlug(activity)}/${activity.slug}` as const;
}

export function activityUrl(activity: ActivityPathInput) {
  const route = activityRoute(activity);
  return route ? absoluteUrl(route) : null;
}

export function activitiesPageRoute(pageNumber: number) {
  return pageNumber <= 1
    ? activitiesRoute()
    : typedRoute(`/activities/page/${pageNumber}`);
}

export function projectsRoute() {
  return typedRoute("/projects");
}

export function projectRoute(slug: string) {
  return typedRoute(`/projects/${slug}`);
}

export function projectUrl(slug: string) {
  return absoluteUrl(projectRoute(slug));
}

export function projectPageRoute(projectSlug: string, pageNumber: number) {
  return pageNumber <= 1
    ? projectRoute(projectSlug)
    : typedRoute(`/projects/${projectSlug}/page/${pageNumber}`);
}

export function topicRoute(slug: string) {
  return typedRoute(`/topics/${slug}`);
}

export function topicUrl(slug: string) {
  return absoluteUrl(topicRoute(slug));
}

export function topicPageRoute(topicSlug: string, pageNumber: number) {
  return pageNumber <= 1
    ? topicRoute(topicSlug)
    : typedRoute(`/topics/${topicSlug}/page/${pageNumber}`);
}

export function lyovsonRoute(username: string) {
  return typedRoute(`/${username}`);
}

export function lyovsonUrl(username: string) {
  return absoluteUrl(lyovsonRoute(username));
}

export function lyovsonBioRoute(username: string) {
  return typedRoute(`/${username}/bio`);
}

export function lyovsonContactRoute(username: string) {
  return typedRoute(`/${username}/contact`);
}

export function lyovsonPortfolioRoute(username: string) {
  return typedRoute(`/${username}/portfolio`);
}

export function lyovsonPostsRoute(username: string) {
  return typedRoute(`/${username}/posts`);
}

export function lyovsonPostsPageRoute(username: string, pageNumber: number) {
  return pageNumber <= 1
    ? lyovsonPostsRoute(username)
    : typedRoute(`/${username}/posts/page/${pageNumber}`);
}

export function lyovsonNotesRoute(username: string) {
  return typedRoute(`/${username}/notes`);
}

export function lyovsonNotesPageRoute(username: string, pageNumber: number) {
  return pageNumber <= 1
    ? lyovsonNotesRoute(username)
    : typedRoute(`/${username}/notes/page/${pageNumber}`);
}

export function lyovsonActivitiesRoute(username: string) {
  return typedRoute(`/${username}/activities`);
}

export function lyovsonActivitiesPageRoute(
  username: string,
  pageNumber: number
) {
  return pageNumber <= 1
    ? lyovsonActivitiesRoute(username)
    : typedRoute(`/${username}/activities/page/${pageNumber}`);
}

export function lyovsonPageRoute(username: string, pageNumber: number) {
  return pageNumber <= 1
    ? lyovsonRoute(username)
    : typedRoute(`/${username}/page/${pageNumber}`);
}

export function searchRoute() {
  return typedRoute("/search");
}

export function lyovsonSearchRoute(username: string) {
  return typedRoute(`/${username}/search`);
}

export function searchPageRoute(scopeUsername?: string | null) {
  return scopeUsername ? lyovsonSearchRoute(scopeUsername) : searchRoute();
}

export function searchHref(
  query: string,
  options?: { scopeUsername?: string | null }
) {
  const params = new URLSearchParams({ q: query });
  const route = searchPageRoute(options?.scopeUsername);
  return `${route}?${params.toString()}` as `${Route<string>}?${string}`;
}

export function absoluteUrl(path: Route<string> | string) {
  return new URL(String(path), getCanonicalURL()).toString();
}

export function postReferenceRoute(relationTo: string, slug: string) {
  if (relationTo !== "posts") {
    return null;
  }

  return postRoute(slug);
}
