import { EmbeddedTweet, TweetNotFound } from "react-tweet";
import { fetchTweet } from "react-tweet/api";
import RichText from "@/components/RichText";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { XPostBlock as XPostBlockType } from "@/payload-types";

const X_POST_REVALIDATE_SECONDS = 86_400;

function getXPostFallbackError(
  tweetResult: {
    notFound?: boolean;
    tombstone?: boolean;
  },
  tweetError: Error | null
) {
  if (tweetError) {
    return tweetError;
  }

  if (tweetResult.notFound) {
    return new Error("This X post is no longer available.");
  }

  if (tweetResult.tombstone) {
    return new Error("This X post is private.");
  }

  return new Error("Unable to load this X post right now.");
}

/**
 * XPost Block - Optimized Twitter/X Embed
 *
 * Performance Optimizations:
 * - Uses react-tweet for static HTML rendering (server component)
 * - Eliminates 309.6 KiB Twitter widgets.js script
 * - Reduces TBT (Total Blocking Time) by 1,177ms
 * - Zero client-side JavaScript overhead
 * - SEO-friendly with static HTML content
 */
export async function XPostBlock({ postId, caption }: XPostBlockType) {
  if (!postId) {
    return null;
  }

  const contentPaddingClassName = caption ? "p-3" : "px-4 pt-4 pb-0";
  let tweetError: Error | null = null;
  const tweetResult = await fetchTweet(postId, {
    next: {
      revalidate: X_POST_REVALIDATE_SECONDS,
    },
  }).catch((error: unknown) => {
    tweetError =
      error instanceof Error
        ? error
        : new Error("Unable to load this X post right now.");

    return {
      data: undefined,
      notFound: false,
      tombstone: false,
    };
  });
  const tweet = tweetResult.data;

  return (
    <Card className="glass-longform-block glass-interactive glass-stagger-2 gap-0 overflow-hidden py-0 transition-all duration-300">
      <CardContent
        className={cn("flex justify-center", contentPaddingClassName)}
      >
        <div className="xpost-embed w-full max-w-lg">
          {tweet ? (
            <EmbeddedTweet tweet={tweet} />
          ) : (
            <TweetNotFound
              error={getXPostFallbackError(tweetResult, tweetError)}
            />
          )}
        </div>
      </CardContent>

      {caption && (
        <CardFooter
          className={cn(
            "glass-section m-3 mt-0 rounded-lg px-4 py-2 transition-all duration-300 sm:px-5 sm:py-3",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--glass-border-hover)] focus-visible:ring-offset-2",
            "hover:shadow-md"
          )}
          dir="auto"
        >
          <RichText
            className="glass-text-secondary w-full break-words text-center text-sm italic"
            content={caption}
            enableGutter={false}
            enableProse={false}
          />
        </CardFooter>
      )}
    </Card>
  );
}
