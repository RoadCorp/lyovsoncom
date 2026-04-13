import { revalidatePath, revalidateTag } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  PayloadRequest,
} from "payload";
import type { Post } from "@/payload-types";

interface AuthorLike {
  id?: number | string | null;
  username?: string | null;
}

type PostWithPopulatedAuthors = Post & {
  populatedAuthors?: AuthorLike[] | null;
};

interface AuthorRevalidationArgs {
  errorContext: string;
  post: Post;
  req: PayloadRequest;
  successMessage: string;
}

function getPostSlug(post: Pick<Post, "slug">): string | null {
  return typeof post.slug === "string" && post.slug.length > 0
    ? post.slug
    : null;
}

function normalizeUsername(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getAuthorId(author: unknown): number | string | null {
  if (typeof author === "number" || typeof author === "string") {
    return author;
  }

  if (!(author && typeof author === "object" && "id" in author)) {
    return null;
  }

  const authorId = (author as AuthorLike).id;
  return typeof authorId === "number" || typeof authorId === "string"
    ? authorId
    : null;
}

function getAuthorUsername(author: unknown): string | null {
  if (!(author && typeof author === "object" && "username" in author)) {
    return null;
  }

  return normalizeUsername((author as AuthorLike).username);
}

function getPopulatedAuthors(post: Post): AuthorLike[] | null {
  const postWithPopulatedAuthors = post as PostWithPopulatedAuthors;
  return Array.isArray(postWithPopulatedAuthors.populatedAuthors)
    ? postWithPopulatedAuthors.populatedAuthors
    : null;
}

async function getUsernamesFromAuthorIds(
  req: PayloadRequest,
  authorIds: Set<number | string>
): Promise<string[]> {
  const resolvedUsernames = await Promise.all(
    [...authorIds].map(async (authorId) => {
      try {
        const user = await req.payload.findByID({
          collection: "lyovsons",
          id: authorId,
        });

        return normalizeUsername(user?.username);
      } catch {
        return null;
      }
    })
  );

  return resolvedUsernames.filter((username): username is string =>
    Boolean(username)
  );
}

async function getAuthorUsernames(
  req: PayloadRequest,
  authors: Post["authors"] | undefined,
  populatedAuthors?: AuthorLike[] | null
): Promise<string[]> {
  const usernames = new Set<string>();

  if (Array.isArray(populatedAuthors)) {
    for (const author of populatedAuthors) {
      const username = normalizeUsername(author?.username);
      if (username) {
        usernames.add(username);
      }
    }
  }

  if (!Array.isArray(authors)) {
    return [...usernames];
  }

  const authorIds = new Set<number | string>();

  for (const author of authors) {
    const directUsername = getAuthorUsername(author);
    if (directUsername) {
      usernames.add(directUsername);
    }

    const authorId = getAuthorId(author);
    if (authorId !== null) {
      authorIds.add(authorId);
    }
  }

  const usernamesFromIds = await getUsernamesFromAuthorIds(req, authorIds);
  for (const username of usernamesFromIds) {
    usernames.add(username);
  }

  return [...usernames];
}

function revalidatePostRootPaths() {
  revalidatePath("/");
  revalidatePath("/posts");
}

function revalidatePostProject(post: Pick<Post, "project">) {
  if (!(post.project && typeof post.project === "object")) {
    return;
  }

  revalidateTag(`project-${post.project.slug}`, "projects");
  revalidatePath(`/projects/${post.project.slug}`);
}

function revalidatePostTagsForNewPublish(slug: string) {
  revalidateTag("posts", { expire: 0 });
  revalidateTag(`post-${slug}`, { expire: 0 });
  revalidateTag("homepage", { expire: 0 });
  revalidateTag("sitemap", { expire: 0 });
}

function revalidatePostTagsForEdit(slug: string) {
  revalidateTag("posts", "posts");
  revalidateTag(`post-${slug}`, "posts");
  revalidateTag("homepage", "homepage");
}

function revalidatePostTagsForRemoval(slug?: string | null) {
  revalidateTag("posts", "posts");
  if (slug) {
    revalidateTag(`post-${slug}`, "posts");
  }
  revalidateTag("homepage", "homepage");
  revalidateTag("sitemap", "sitemap");
}

async function revalidatePostAuthors({
  errorContext,
  post,
  req,
  successMessage,
}: AuthorRevalidationArgs): Promise<void> {
  try {
    const authorUsernames = await getAuthorUsernames(
      req,
      post.authors,
      getPopulatedAuthors(post)
    );

    if (authorUsernames.length === 0) {
      return;
    }

    for (const username of authorUsernames) {
      revalidateTag(`lyovson-${username}`, "authors");
      revalidatePath(`/${username}`);
    }

    req.payload.logger.info(
      `${successMessage}: ${authorUsernames.map((username) => `/${username}`).join(", ")}`
    );
  } catch (error) {
    req.payload.logger.error(
      `Failed to update author pages for ${errorContext}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

async function handlePublishedPost(
  doc: Post,
  previousDoc: Post | null | undefined,
  req: PayloadRequest
) {
  const slug = getPostSlug(doc);
  if (!slug) {
    req.payload.logger.warn(
      `Skipping post revalidation because slug is missing for post "${doc.title}"`
    );
    return;
  }

  const isNewPublish = previousDoc?._status !== "published";
  const path = `/posts/${slug}`;

  req.payload.logger.info(
    `Revalidating post at path: ${path} (${isNewPublish ? "NEW PUBLISH" : "EDIT"})`
  );

  revalidatePath(path);

  if (isNewPublish) {
    revalidatePostTagsForNewPublish(slug);
    revalidatePostRootPaths();
    req.payload.logger.info(
      `✅ NEW POST published: "${doc.title}" - Full cache invalidation (feeds update on natural expiry)`
    );
  } else {
    revalidatePostTagsForEdit(slug);
    req.payload.logger.info(
      `✅ EDITED published post: "${doc.title}" - Cache refreshed (feeds unchanged to reduce DB wake-ups)`
    );
  }

  revalidatePostProject(doc);

  await revalidatePostAuthors({
    errorContext: "post change",
    post: doc,
    req,
    successMessage: "Updated author pages for",
  });
}

async function handleUnpublishedPost(previousDoc: Post, req: PayloadRequest) {
  const slug = getPostSlug(previousDoc);
  if (!slug) {
    req.payload.logger.warn(
      `Skipping unpublish revalidation because previous slug is missing for post "${previousDoc.title}"`
    );
    return;
  }

  const oldPath = `/posts/${slug}`;

  req.payload.logger.info(
    `Updating cache for unpublished post at path: ${oldPath}`
  );

  revalidatePath(oldPath);
  revalidatePostTagsForRemoval(slug);
  revalidatePostRootPaths();
  revalidatePostProject(previousDoc);

  await revalidatePostAuthors({
    errorContext: "previous post state",
    post: previousDoc,
    req,
    successMessage: "Updated author pages after unpublish",
  });
}

export const revalidatePost: CollectionAfterChangeHook<Post> = async ({
  context,
  doc,
  previousDoc,
  req,
}) => {
  if (context?.skipRevalidation) {
    return doc;
  }

  if (doc._status === "published") {
    await handlePublishedPost(doc, previousDoc, req);
  }

  if (previousDoc?._status === "published" && doc._status !== "published") {
    await handleUnpublishedPost(previousDoc, req);
  }

  return doc;
};

export const revalidateDelete: CollectionAfterDeleteHook<Post> = async ({
  doc,
  req,
}) => {
  if (doc) {
    const slug = getPostSlug(doc);
    if (slug) {
      const path = `/posts/${slug}`;
      revalidatePath(path);
      revalidatePostTagsForRemoval(slug);
      revalidatePostRootPaths();
    } else {
      req.payload.logger.warn(
        `Skipping post path revalidation on delete because slug is missing for post "${doc.title}"`
      );
      revalidatePostTagsForRemoval();
      revalidatePostRootPaths();
    }

    revalidatePostProject(doc);
    await revalidatePostAuthors({
      errorContext: "post delete",
      post: doc,
      req,
      successMessage: "Updated author pages after delete",
    });
  } else {
    revalidatePostTagsForRemoval();
    revalidatePostRootPaths();
  }

  return doc;
};
