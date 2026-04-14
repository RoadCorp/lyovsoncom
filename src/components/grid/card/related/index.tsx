import { ViewTransition } from "react";
import { AppLink } from "@/components/AppLink";
import { GridCard, GridCardSection } from "@/components/grid";
import { Media } from "@/components/Media";
import { cn } from "@/lib/utils";
import type { Post } from "@/payload-types";
import { postRoute, transitionTypes } from "@/utilities/routes";
import {
  frontendViewTransitionClasses,
  getPostMediaTransitionName,
  getPostTitleTransitionName,
} from "@/utilities/view-transitions";

const MAX_STAGGER_INDEX = 6;

export { GridCardRelatedNotes } from "./grid-card-related-notes";

function getStaggerClass(index: number): string {
  return `glass-stagger-${Math.min(index + 1, MAX_STAGGER_INDEX)}`;
}

export const GridCardRelatedPosts = ({
  posts,
  className,
}: {
  posts: (number | Post)[];
  className?: string;
}) => {
  return (
    <GridCard className={cn(className)}>
      {posts.map((post, index) => {
        if (typeof post === "number") {
          return null;
        }
        if (!post.slug) {
          return null;
        }
        const rowClass = `row-start-${index + 1} row-end-${index + 2}`;
        const staggerClass = getStaggerClass(index);
        return (
          <AppLink
            aria-label={`Read related post: ${post.title}`}
            className={cn(
              "group glass-interactive col-start-1 col-end-4",
              rowClass,
              staggerClass
            )}
            href={postRoute(post.slug)}
            key={post.id}
            prefetch={false}
            transitionTypes={[transitionTypes.postDrillIn]}
          >
            <GridCardSection
              className={"grid h-full grid-cols-3 grid-rows-1 gap-2"}
              flush={true}
            >
              {post.featuredImage && (
                <ViewTransition
                  name={getPostMediaTransitionName(post.slug)}
                  {...frontendViewTransitionClasses.sharedMedia}
                >
                  <Media
                    className="glass-media flex h-full items-center justify-center"
                    imgClassName="object-cover h-full"
                    pictureClassName="row-start-1 row-end-2 col-start-1 col-end-2 h-full"
                    resource={post.featuredImage}
                  />
                </ViewTransition>
              )}
              <div className="col-start-2 col-end-4 row-start-1 row-end-2 grid items-center">
                <ViewTransition
                  name={getPostTitleTransitionName(post.slug)}
                  {...frontendViewTransitionClasses.sharedTitle}
                >
                  <h2 className="glass-text font-medium transition-colors duration-300 group-hover:text-[var(--glass-text-secondary)]">
                    {post.title}
                  </h2>
                </ViewTransition>
              </div>
            </GridCardSection>
          </AppLink>
        );
      })}
    </GridCard>
  );
};
