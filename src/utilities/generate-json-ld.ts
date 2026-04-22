/**
 * JSON-LD Schema generation utilities for SEO
 *
 * This module provides utilities for generating Schema.org structured data in JSON-LD format.
 * Follows Schema.org standards and 2025 SEO best practices for rich snippets, search engine
 * understanding, and AI discovery.
 *
 * @module generate-json-ld
 * @see https://schema.org for full Schema.org documentation
 * @see https://developers.google.com/search/docs/appearance/structured-data for Google's guide
 */

import type {
  ArticleSchema,
  BreadcrumbListSchema,
  CollectionPageSchema,
  OrganizationSchema,
  PersonSchema,
  ProfilePageSchema,
  WebSiteSchema,
} from "@/types/schema";
import { getCanonicalURL } from "./getURL";
import { absoluteUrl, lyovsonRoute } from "./routes";
import {
  getSiteEntityAuthorData,
  getSiteLogoUrl,
  siteConfig,
} from "./site-config";

const DEFAULT_IMAGE_HEIGHT = 630;
const DEFAULT_IMAGE_WIDTH = 1200;

/**
 * Organization data (reused across schemas)
 * Contains the publisher information for all content on the site
 */
const organizationData: OrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: getCanonicalURL(),
  logo: {
    "@type": "ImageObject",
    url: getSiteLogoUrl(),
    width: 512,
    height: 512,
  },
  sameAs: getSiteEntityAuthorData().flatMap((author) => author.sameAs),
  description:
    "Website and blog of Rafa and Jess Lyóvson featuring writing, projects, and research.",
};

const websiteData: WebSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  alternateName: [...siteConfig.alternateNames],
  url: getCanonicalURL(),
  description: organizationData.description,
  inLanguage: "en-US",
  potentialAction: {
    "@type": "SearchAction",
    target: `${getCanonicalURL()}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
  publisher: organizationData,
  author: getSiteEntityAuthorData().map((author) =>
    generatePersonSchema({
      name: author.name,
      username: author.username,
      sameAs: author.sameAs,
    })
  ),
};

/**
 * Parameters for generating an Article schema
 */
interface ArticleDataParams {
  authors?: Array<{
    avatarUrl?: string;
    bio?: string;
    name: string;
    sameAs?: string[];
    username: string;
  }>;
  description?: string;
  imageHeight?: number;
  imageUrl?: string;
  imageWidth?: number;
  keywords?: string[];
  pathPrefix?: string; // e.g., '/posts', '/notes', '/activities' (defaults to '/posts')
  publishedAt?: string;
  slug: string;
  title: string;
  updatedAt?: string;
  url?: string; // Full URL override (takes precedence over pathPrefix)
  wordCount?: number;
}

/**
 * Generate Article schema for blog posts and articles
 *
 * Creates a Schema.org Article structured data object that helps search engines
 * understand the content, authorship, publication dates, and related metadata.
 * This enables rich snippets in search results with article preview, author info,
 * and publication date.
 *
 * @param data - Article metadata including title, description, authors, etc.
 * @returns Complete ArticleSchema object ready for JSON-LD embedding
 *
 * @example
 * ```typescript
 * const schema = generateArticleSchema({
 *   title: "Building Modern Web Apps",
 *   description: "A guide to Next.js 15",
 *   slug: "modern-web-apps",
 *   publishedAt: "2025-01-14T10:00:00Z",
 *   authors: [{ name: "Rafa Lyovson", username: "rafa" }],
 *   imageUrl: "https://www.lyovson.com/images/article.jpg",
 *   keywords: ["nextjs", "react", "web-development"],
 *   wordCount: 2500
 * });
 * ```
 */
export function generateArticleSchema(data: ArticleDataParams): ArticleSchema {
  const pathPrefix = data.pathPrefix || "/posts";
  const articleUrl = data.url || absoluteUrl(`${pathPrefix}/${data.slug}`);

  const imageObject = data.imageUrl
    ? {
        "@type": "ImageObject" as const,
        url: data.imageUrl,
        width: data.imageWidth || DEFAULT_IMAGE_WIDTH,
        height: data.imageHeight || DEFAULT_IMAGE_HEIGHT,
      }
    : undefined;

  const authorSchemas =
    data.authors && data.authors.length > 0
      ? data.authors.map((author) => ({
          ...generatePersonSchema({
            name: author.name,
            username: author.username,
            avatarUrl: author.avatarUrl,
            bio: author.bio,
            sameAs: author.sameAs,
          }),
        }))
      : [
          {
            "@context": "https://schema.org" as const,
            "@type": "Person" as const,
            name: "Lyóvson Team",
            url: getCanonicalURL(),
          },
        ];

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.title,
    description: data.description,
    image: imageObject,
    datePublished:
      data.publishedAt || data.updatedAt || new Date().toISOString(),
    dateModified: data.updatedAt || new Date().toISOString(),
    author: authorSchemas,
    publisher: organizationData,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    keywords: data.keywords?.join(", "),
    wordCount: data.wordCount,
    inLanguage: "en-US",
  };
}

/**
 * Parameters for generating a Person schema
 */
interface PersonDataParams {
  avatarUrl?: string;
  bio?: string;
  expertise?: string[];
  jobTitle?: string;
  name: string;
  sameAs?: string[];
  username: string;
}

/**
 * Generate Person schema for author and profile pages
 *
 * Creates a Schema.org Person structured data object that helps search engines
 * understand the author's identity, social profiles, and areas of expertise.
 * Useful for author pages, team pages, and establishing authorship authority.
 *
 * @param data - Person metadata including name, bio, social links, etc.
 * @returns Complete PersonSchema object ready for JSON-LD embedding
 *
 * @example
 * ```typescript
 * const schema = generatePersonSchema({
 *   name: "Rafa Lyovson",
 *   username: "rafa",
 *   bio: "Software engineer and writer",
 *   avatarUrl: "https://www.lyovson.com/images/rafa.jpg",
 *   jobTitle: "Full-stack Developer",
 *   socialLinks: {
 *     twitter: "https://x.com/rafalyovson",
 *     github: "https://github.com/rafalyovson"
 *   },
 *   expertise: ["JavaScript", "React", "Next.js"]
 * });
 * ```
 */
export function generatePersonSchema(data: PersonDataParams): PersonSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.name,
    url: absoluteUrl(lyovsonRoute(data.username)),
    image: data.avatarUrl,
    jobTitle: data.jobTitle,
    description: data.bio,
    sameAs: data.sameAs?.length ? data.sameAs : undefined,
    knowsAbout: data.expertise,
  };
}

export function generateProfilePageSchema({
  description,
  person,
  url,
}: {
  description?: string;
  person: PersonSchema;
  url: string;
}): ProfilePageSchema {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: person.name,
    description,
    url,
    mainEntity: person,
    inLanguage: "en-US",
  };
}

/**
 * Breadcrumb item for navigation paths
 */
interface BreadcrumbItem {
  name: string;
  url?: string;
}

/**
 * Generate BreadcrumbList schema for navigation
 *
 * Creates a Schema.org BreadcrumbList structured data object that helps search
 * engines understand the page hierarchy and navigation path. This enables breadcrumb
 * rich snippets in search results, showing the site structure.
 *
 * @param items - Array of breadcrumb items (name and optional URL)
 * @returns Complete BreadcrumbListSchema object ready for JSON-LD embedding
 *
 * @example
 * ```typescript
 * const schema = generateBreadcrumbSchema([
 *   { name: "Home", url: "https://www.lyovson.com" },
 *   { name: "Posts", url: "https://www.lyovson.com/posts" },
 *   { name: "Article Title" } // Current page (no URL)
 * ]);
 * ```
 */
export function generateBreadcrumbSchema(
  items: BreadcrumbItem[]
): BreadcrumbListSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Parameters for generating a CollectionPage schema
 */
interface CollectionPageDataParams {
  description?: string;
  itemCount?: number;
  items?: Array<{ url: string }>;
  name: string;
  url: string;
}

/**
 * Generate CollectionPage schema for listing pages
 *
 * Creates a Schema.org CollectionPage structured data object for pages that display
 * collections of items (e.g., blog post lists, project galleries). Helps search engines
 * understand the collection and its items, enabling rich snippets for list pages.
 *
 * @param data - Collection metadata including name, description, items, etc.
 * @returns Complete CollectionPageSchema object ready for JSON-LD embedding
 *
 * @example
 * ```typescript
 * const schema = generateCollectionPageSchema({
 *   name: "All Blog Posts",
 *   description: "Browse all articles and writing",
 *   url: "https://www.lyovson.com/posts",
 *   itemCount: 42,
 *   items: [
 *     { url: "https://www.lyovson.com/posts/article-1" },
 *     { url: "https://www.lyovson.com/posts/article-2" }
 *   ]
 * });
 * ```
 */
export function generateCollectionPageSchema(
  data: CollectionPageDataParams
): CollectionPageSchema {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: data.name,
    description: data.description,
    url: data.url,
    mainEntity:
      data.itemCount === undefined
        ? undefined
        : {
            "@type": "ItemList",
            numberOfItems: data.itemCount,
            itemListElement: data.items?.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: item.url,
            })),
          },
    inLanguage: "en-US",
  };
}

/**
 * Get the organization schema for the site
 *
 * Returns the pre-configured Organization schema that represents the site publisher.
 * This is reused across all article schemas and can be used standalone for site-level
 * structured data.
 *
 * @returns Complete OrganizationSchema object for Lyovson.com
 *
 * @example
 * ```typescript
 * const orgSchema = getOrganizationSchema();
 * // Use in site-wide JSON-LD or reference in other schemas
 * ```
 */
export function getOrganizationSchema(): OrganizationSchema {
  return organizationData;
}

export function getSiteEntitySchemas(): [WebSiteSchema, OrganizationSchema] {
  return [websiteData, organizationData];
}
