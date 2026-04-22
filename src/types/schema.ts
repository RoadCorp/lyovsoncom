// Schema.org TypeScript types for SEO-optimized structured data
// Following https://schema.org specifications for 2025

// Base Schema.org type
type SchemaContext = "https://schema.org";

// Common properties shared across types
interface BaseSchema {
  "@context": SchemaContext;
  "@type": string;
}

// ImageObject for media representations (when used as nested object)
export interface ImageObjectNested {
  "@type": "ImageObject";
  caption?: string;
  height?: number;
  url: string;
  width?: number;
}

// ImageObject for standalone schema (with @context)
export type ImageObject = BaseSchema & ImageObjectNested;

// Person schema for authors and contributors
export type PersonSchema = BaseSchema & {
  "@type": "Person";
  name: string;
  url?: string;
  image?: string | ImageObjectNested;
  jobTitle?: string;
  description?: string;
  sameAs?: string[]; // Social media profiles
  knowsAbout?: string[]; // Areas of expertise
  email?: string;
};

// Organization schema for publisher information
export type OrganizationSchema = BaseSchema & {
  "@type": "Organization";
  name: string;
  url: string;
  logo?: ImageObjectNested;
  sameAs?: string[];
  description?: string;
  email?: string;
};

// Article schema for blog posts
export type ArticleSchema = BaseSchema & {
  "@type": "Article" | "BlogPosting" | "TechArticle";
  headline: string;
  description?: string;
  image?: string | ImageObjectNested | Array<string | ImageObjectNested>;
  datePublished: string;
  dateModified?: string;
  author: PersonSchema | PersonSchema[];
  publisher: OrganizationSchema;
  mainEntityOfPage: {
    "@type": "WebPage";
    "@id": string;
  };
  keywords?: string;
  articleSection?: string;
  wordCount?: number;
  inLanguage?: string;
};

// BreadcrumbList schema for navigation
interface BreadcrumbListItem {
  "@type": "ListItem";
  item?: string;
  name: string;
  position: number;
}

export type BreadcrumbListSchema = BaseSchema & {
  "@type": "BreadcrumbList";
  itemListElement: BreadcrumbListItem[];
};

// CollectionPage schema for listing pages
export type CollectionPageSchema = BaseSchema & {
  "@type": "CollectionPage";
  name: string;
  description?: string;
  url: string;
  mainEntity?: {
    "@type": "ItemList";
    numberOfItems: number;
    itemListElement?: Array<{
      "@type": "ListItem";
      position: number;
      url: string;
    }>;
  };
  inLanguage?: string;
};

export type ProfilePageSchema = BaseSchema & {
  "@type": "ProfilePage";
  name: string;
  description?: string;
  url: string;
  mainEntity: PersonSchema;
  inLanguage?: string;
};

// WebSite schema for the entire site
export type WebSiteSchema = BaseSchema & {
  "@type": "WebSite";
  name: string;
  alternateName?: string[];
  url: string;
  description?: string;
  inLanguage?: string;
  potentialAction?: {
    "@type": "SearchAction";
    target: string;
    "query-input": string;
  };
  publisher?: OrganizationSchema;
  author?: PersonSchema | PersonSchema[];
};

// Union type for all schemas
export type Schema =
  | ArticleSchema
  | PersonSchema
  | OrganizationSchema
  | BreadcrumbListSchema
  | CollectionPageSchema
  | ProfilePageSchema
  | WebSiteSchema;

// Helper type for JSON-LD script tag
export interface JsonLdProps {
  data: Schema | Schema[];
}
