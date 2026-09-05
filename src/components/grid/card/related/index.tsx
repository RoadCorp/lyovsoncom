import { GridCard, GridCardSection } from "@/components/grid";
import { Media } from "@/components/Media";
import { CARD_THUMBNAIL_IMAGE_SIZE } from "@/components/Media/image-sizes";
import { PostDrillInLink } from "@/components/post-transitions/PostDrillInLink";
import { PostTransitionBoundary } from "@/components/post-transitions/PostTransitionBoundary";
import { cn } from "@/lib/utils";
import type { Post } from "@/payload-types";
import { postRoute } from "@/utilities/routes";

export { GridCardRelatedNotes } from "./grid-card-related-notes";

function isUniquePostWithSlug(
  post: number | Post,
  seenSlugs: Set<string>
): post is Post & { slug: string } {
  if (typeof post === "number" || !post.slug || seenSlugs.has(post.slug)) {
    return false;
  }

  seenSlugs.add(post.slug);
  return true;
}

export const GridCardRelatedPosts = ({
  posts,
  className,
}: {
  posts: (number | Post)[];
  className?: string;
}) => {
  const seenSlugs = new Set<string>();
  const uniquePosts = posts.filter((post) =>
    isUniquePostWithSlug(post, seenSlugs)
  );

  return (
    <GridCard className={cn(className)} frameLabel="Related">
      {uniquePosts.map((post, index) => {
        const rowClass = `row-start-${index + 1} row-end-${index + 2}`;
        return (
          <PostDrillInLink
            aria-label={`Read related post: ${post.title}`}
            className={cn(
              "ui-focus-ring group ui-interactive col-start-1 col-end-4",
              rowClass
            )}
            href={postRoute(post.slug)}
            key={post.id}
          >
            <PostTransitionBoundary variant="cardShell">
              <GridCardSection
                className={
                  "surface-row grid h-full grid-cols-3 grid-rows-1 gap-2"
                }
                flush={true}
              >
                {post.featuredImage ? (
                  <PostTransitionBoundary slug={post.slug} variant="media">
                    <Media
                      className="media-frame flex h-full items-center justify-center"
                      imgClassName="object-cover h-full"
                      pictureClassName="row-start-1 row-end-2 col-start-1 col-end-2 h-full"
                      resource={post.featuredImage}
                      size={CARD_THUMBNAIL_IMAGE_SIZE}
                    />
                  </PostTransitionBoundary>
                ) : null}
                <div className="col-start-2 col-end-4 row-start-1 row-end-2 grid items-center">
                  <PostTransitionBoundary slug={post.slug} variant="title">
                    <h2 className="tone-heading ui-group-hover-dim font-medium">
                      {post.title}
                    </h2>
                  </PostTransitionBoundary>
                </div>
              </GridCardSection>
            </PostTransitionBoundary>
          </PostDrillInLink>
        );
      })}
    </GridCard>
  );
};
