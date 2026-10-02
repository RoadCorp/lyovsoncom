import type { Route } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import type { PaginatedDocs } from "payload";
import type { ReactNode } from "react";
import { CollectionArchive } from "@/components/CollectionArchive";
import { JsonLd } from "@/components/json-ld";
import { Pagination } from "@/components/Pagination";
import { PublicPageBoundary } from "@/components/public-page-boundary";
import { getPaginatedStaticParams } from "@/utilities/archive";
import { ensureStaticParams } from "@/utilities/ensure-static-params";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getProjectPostCount } from "@/utilities/get-project-posts";
import { getAllTopics } from "@/utilities/get-topic";
import { getTopicPostCount } from "@/utilities/get-topic-posts";
import {
  buildPaginatedArchiveMetadata,
  getPaginatedArchivePageState,
  isPaginatedArchivePageOutOfRange,
} from "@/utilities/paginated-archive";
import { getPayloadClient } from "@/utilities/payload-client";
import type { PostSummary } from "@/utilities/post-summary";
import { absoluteUrl, postRoute } from "@/utilities/routes";
import { buildNotFoundMetadata } from "@/utilities/seo-metadata";

/** Parent collections whose posts get a paginated archive. */
export type ArchiveEntity = "projects" | "topics";

interface ArchiveEntityDoc {
  description?: string | null;
  name: string;
}

async function listProjectSlugs() {
  const payload = await getPayloadClient();
  const projects = await payload.find({
    collection: "projects",
    limit: 1000,
  });

  return projects.docs.flatMap((project) =>
    typeof project === "object" && "slug" in project && project.slug
      ? [project.slug]
      : []
  );
}

async function listTopicSlugs() {
  const topics = await getAllTopics();
  return topics.docs.flatMap(({ slug }) => (slug ? [slug] : []));
}

const ENTITY_ARCHIVE_SOURCES: Record<
  ArchiveEntity,
  {
    countPosts: (slug: string) => Promise<number | null>;
    listSlugs: () => Promise<string[]>;
  }
> = {
  projects: { countPosts: getProjectPostCount, listSlugs: listProjectSlugs },
  topics: { countPosts: getTopicPostCount, listSlugs: listTopicSlugs },
};

async function getEntityArchiveStaticParams<TParam extends string>(
  entity: ArchiveEntity,
  param: TParam,
  perPage: number
) {
  "use cache";
  cacheTag(entity);
  cacheLife("static");

  const { countPosts, listSlugs } = ENTITY_ARCHIVE_SOURCES[entity];
  const paths: Record<TParam | "pageNumber", string>[] = [];
  let fallbackSlug: string | null = null;

  for (const slug of await listSlugs()) {
    fallbackSlug ??= slug;

    const totalPosts = await countPosts(slug);
    for (const pageNumber of getPaginatedStaticParams(
      totalPosts ?? 0,
      perPage
    )) {
      paths.push({ [param]: slug, pageNumber } as Record<
        TParam | "pageNumber",
        string
      >);
    }
  }

  return ensureStaticParams(paths, {
    [param]: fallbackSlug || "__placeholder__",
    pageNumber: "__placeholder__",
  } as Record<TParam | "pageNumber", string>);
}

interface EntityArchivePageArgs<TParam extends string> {
  params: Promise<Record<TParam | "pageNumber", string>>;
}

interface EntityArchivePageParts<TEntity> {
  entity: TEntity;
  jsonLd: ReactNode;
  name: string;
  pageNumber: number;
  pagination: ReactNode;
  posts: ReactNode;
}

interface EntityArchivePageConfig<
  TEntity extends ArchiveEntityDoc,
  TParam extends string,
  TIndex extends string,
> {
  copy: {
    /** Used when the entity has no description of its own. */
    metaDescription: (name: string, pageNumber: number) => string;
    metaTitle: (name: string, pageNumber: number) => string;
    notFound: { description: string; title: string };
    /** Used when the entity has no description of its own. */
    schemaDescription: (name: string, pageNumber: number) => string;
  };
  /** Collection that lists the entities for static params; also the cache tag. */
  entity: ArchiveEntity;
  getEntity: (slug: string) => Promise<TEntity | null>;
  getPage: (
    slug: string,
    pageNumber: number,
    limit: number
  ) => Promise<PaginatedDocs<PostSummary> | null>;
  /** Route param that holds the entity slug. */
  param: TParam;
  perPage: number;
  /**
   * Lays the parts out with the page's own heading and any hero. Return one
   * flat fragment: nesting would change the RSC payload.
   */
  renderPage: (parts: EntityArchivePageParts<TEntity>) => ReactNode;
  routes: {
    index: (slug: string) => Route<TIndex>;
    page: (slug: string, pageNumber: number) => string;
  };
}

/**
 * Builds `/<entity>/[slug]/page/[pageNumber]`: the paginated posts of one
 * topic or project. Route segment config such as `prefetch` must stay a
 * literal export in each page.
 */
export function createEntityArchivePage<
  TEntity extends ArchiveEntityDoc,
  TParam extends string,
  TIndex extends string,
>({
  copy,
  entity: entityCollection,
  getEntity,
  getPage,
  param,
  perPage,
  renderPage,
  routes,
}: EntityArchivePageConfig<TEntity, TParam, TIndex>) {
  function generateStaticParams() {
    return getEntityArchiveStaticParams(entityCollection, param, perPage);
  }

  async function PageContent({
    params: paramsPromise,
  }: EntityArchivePageArgs<TParam>) {
    const params = await paramsPromise;
    const slug = params[param];
    const pageState = getPaginatedArchivePageState(params.pageNumber);

    if (pageState.kind === "notFound") {
      notFound();
    }

    if (pageState.kind === "redirect") {
      redirect(routes.index(slug));
    }

    const sanitizedPageNumber = pageState.pageNumber;
    const entity = await getEntity(slug);

    if (!entity) {
      return notFound();
    }

    const response = await getPage(slug, sanitizedPageNumber, perPage);

    if (
      !response ||
      isPaginatedArchivePageOutOfRange(sanitizedPageNumber, response.totalPages)
    ) {
      return notFound();
    }

    const { docs: posts, page, totalDocs, totalPages } = response;
    const name = entity.name || slug;

    const collectionPageSchema = generateCollectionPageSchema({
      name: `${name} - Page ${sanitizedPageNumber}`,
      description:
        entity.description || copy.schemaDescription(name, sanitizedPageNumber),
      url: absoluteUrl(routes.page(slug, sanitizedPageNumber)),
      itemCount: totalDocs,
      items: posts.flatMap((post) =>
        post.slug ? [{ url: absoluteUrl(postRoute(post.slug)) }] : []
      ),
    });

    return renderPage({
      entity,
      jsonLd: <JsonLd data={collectionPageSchema} />,
      name,
      pageNumber: sanitizedPageNumber,
      pagination:
        totalPages > 1 && page ? (
          <Pagination
            getPageHref={(pageNumberValue) =>
              routes.page(slug, pageNumberValue)
            }
            page={page}
            totalPages={totalPages}
          />
        ) : null,
      posts: <CollectionArchive posts={posts} />,
    });
  }

  async function generateMetadata({
    params: paramsPromise,
  }: EntityArchivePageArgs<TParam>): Promise<Metadata> {
    const params = await paramsPromise;
    const slug = params[param];
    const pageState = getPaginatedArchivePageState(params.pageNumber);

    if (pageState.kind !== "page") {
      return buildNotFoundMetadata();
    }

    const sanitizedPageNumber = pageState.pageNumber;
    const entity = await getEntity(slug);

    if (!entity) {
      return buildNotFoundMetadata(copy.notFound);
    }

    const name = entity.name || slug;

    return buildPaginatedArchiveMetadata({
      canonicalPath: routes.page(slug, sanitizedPageNumber),
      description:
        entity.description || copy.metaDescription(name, sanitizedPageNumber),
      pageNumber: sanitizedPageNumber,
      title: copy.metaTitle(name, sanitizedPageNumber),
    });
  }

  function Page(props: EntityArchivePageArgs<TParam>) {
    return (
      <PublicPageBoundary>
        <PageContent {...props} />
      </PublicPageBoundary>
    );
  }

  return { generateMetadata, generateStaticParams, Page };
}
