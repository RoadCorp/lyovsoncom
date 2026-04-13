import { notFound, redirect } from "next/navigation";
import type { CollectionSlug } from "payload";
import type React from "react";
import { getDocument } from "@/utilities/getDocument";
import { getRedirects } from "@/utilities/getRedirects";
import { postReferenceRoute } from "@/utilities/routes";

interface Props {
  disableNotFound?: boolean;
  url: string;
}

interface RedirectReferenceValue {
  slug?: string;
}

function getRedirectReferencePath(relationTo: string, slug: string) {
  return postReferenceRoute(relationTo, slug) || `/${relationTo}/${slug}`;
}

function normalizeRedirectUrl(url: string) {
  return url.startsWith("/") ? url : `/${url}`;
}

function getInlineReferenceSlug(value: unknown) {
  if (!value || typeof value !== "object" || !("slug" in value)) {
    return null;
  }

  return typeof (value as RedirectReferenceValue).slug === "string"
    ? (value as RedirectReferenceValue).slug
    : null;
}

async function getReferenceSlug(relationTo: string, value: unknown) {
  if (typeof value !== "string") {
    return getInlineReferenceSlug(value);
  }

  const document = await getDocument(relationTo as CollectionSlug, value);
  if (!document || typeof document !== "object" || !("slug" in document)) {
    return null;
  }

  return typeof document.slug === "string" ? document.slug : null;
}

async function getRedirectReferenceTarget(redirectUrl: string) {
  const redirects = await getRedirects();
  const redirectItem = redirects.find(
    (redirectEntry) => redirectEntry.from === redirectUrl
  );

  if (redirectItem?.to?.url) {
    return redirectItem.to.url;
  }

  const reference = redirectItem?.to?.reference;
  if (!reference?.relationTo) {
    return null;
  }

  const slug = await getReferenceSlug(reference.relationTo, reference.value);
  return slug ? getRedirectReferencePath(reference.relationTo, slug) : null;
}

/* This component helps us with SSR based dynamic redirects */
export const PayloadRedirects: React.FC<Props> = async ({
  disableNotFound,
  url,
}) => {
  const redirectTarget = await getRedirectReferenceTarget(
    normalizeRedirectUrl(url)
  );

  if (redirectTarget) {
    redirect(redirectTarget as never);
  }

  if (disableNotFound) {
    return null;
  }

  notFound();
};
