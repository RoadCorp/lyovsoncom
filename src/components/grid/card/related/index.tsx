import { GridCard, GridCardSection } from "@/components/grid";
import { Media } from "@/components/Media";
import { PostDrillInLink } from "@/components/post-transitions/PostDrillInLink";
import { PostTransitionBoundary } from "@/components/post-transitions/PostTransitionBoundary";
import { cn } from "@/lib/utils";
import type { Post } from "@/payload-types";
import { postRoute } from "@/utilities/routes";

const MAX_STAGGER_INDEX = 6;

export { GridCardRelatedNotes } from "./grid-card-related-notes";

function getStaggerClass(index: number): string {
  return `glass-stagger-${Math.min(index + 1, MAX_STAGGER_INDEX)}`;
}

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
    <GridCard className={cn(className)}>
      {uniquePosts.map((post, index) => {
        const rowClass = `row-start-${index + 1} row-end-${index + 2}`;
        const staggerClass = getStaggerClass(index);
        return (
          <PostDrillInLink
            aria-label={`Read related post: ${post.title}`}
            className={cn(
              "group glass-interactive col-start-1 col-end-4",
              rowClass,
              staggerClass
            )}
            href={postRoute(post.slug)}
            key={post.id}
          >
            <PostTransitionBoundary variant="cardShell">
              <GridCardSection
                className={"grid h-full grid-cols-3 grid-rows-1 gap-2"}
                flush={true}
              >
                {post.featuredImage ? (
                  <PostTransitionBoundary slug={post.slug} variant="media">
                    <Media
                      className="glass-media flex h-full items-center justify-center"
                      imgClassName="object-cover h-full"
                      pictureClassName="row-start-1 row-end-2 col-start-1 col-end-2 h-full"
                      resource={post.featuredImage}
                    />
                  </PostTransitionBoundary>
                ) : null}
                <div className="col-start-2 col-end-4 row-start-1 row-end-2 grid items-center">
                  <PostTransitionBoundary slug={post.slug} variant="title">
                    <h2 className="glass-text font-medium transition-colors duration-300 group-hover:text-[var(--glass-text-secondary)]">
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
