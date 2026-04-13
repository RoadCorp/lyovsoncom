import type React from "react";
import { AppLink } from "@/components/AppLink";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { postReferenceRoute } from "@/utilities/routes";

type LinkReferenceValue =
  | number
  | string
  | {
      id?: number | string | null;
      slug?: string | null;
      [key: string]: unknown;
    };

interface CMSLinkType {
  appearance?: "inline" | ButtonProps["variant"];
  children?: React.ReactNode;
  className?: string;
  label?: string | null;
  newTab?: boolean | null;
  reference?: {
    relationTo: string;
    value: LinkReferenceValue;
  } | null;
  size?: ButtonProps["size"] | null;
  type?: "custom" | "reference" | null;
  url?: string | null;
}

function getReferenceSlug(
  value: LinkReferenceValue | null | undefined
): string | null {
  if (!(value && typeof value === "object" && "slug" in value)) {
    return null;
  }

  return typeof value.slug === "string" ? value.slug : null;
}

export const CMSLink: React.FC<CMSLinkType> = ({
  type,
  appearance = "inline",
  children,
  className,
  label,
  newTab,
  reference,
  size: sizeFromProps,
  url,
}) => {
  const referenceHref =
    type === "reference" && reference
      ? postReferenceRoute(
          reference.relationTo,
          getReferenceSlug(reference.value) || ""
        )
      : null;

  const href = referenceHref || url;
  if (!href) {
    return null;
  }

  const isInternalHref = href.startsWith("/");
  const size = appearance === "link" ? null : sizeFromProps;
  const newTabProps = newTab
    ? { rel: "noopener noreferrer", target: "_blank" as const }
    : {};
  const content = (
    <>
      {label || null}
      {children || null}
    </>
  );

  if (appearance === "inline") {
    if (referenceHref || isInternalHref) {
      return (
        <AppLink className={cn(className)} href={href} {...newTabProps}>
          {content}
        </AppLink>
      );
    }

    return (
      <a className={cn(className)} href={href} {...newTabProps}>
        {content}
      </a>
    );
  }

  return (
    <Button asChild className={className} size={size} variant={appearance}>
      {referenceHref || isInternalHref ? (
        <AppLink className={cn(className)} href={href} {...newTabProps}>
          {content}
        </AppLink>
      ) : (
        <a className={cn(className)} href={href} {...newTabProps}>
          {content}
        </a>
      )}
    </Button>
  );
};
