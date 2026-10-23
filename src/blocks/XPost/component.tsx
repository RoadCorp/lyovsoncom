import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { EmbeddedTweet, TweetNotFound } from "react-tweet";
import type { Tweet } from "react-tweet/api";
import { fetchTweet } from "react-tweet/api";
import RichText from "@/components/RichText";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { XPostBlock as XPostBlockType } from "@/payload-types";

type TweetLike = Tweet | NonNullable<Tweet["quoted_tweet"]>;
type TweetWithQuotedTweet = Tweet & {
  quoted_tweet: NonNullable<Tweet["quoted_tweet"]>;
};

function getEntityArray<T>(value: T[] | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function getDisplayTextRange(tweet: TweetLike): [number, number] {
  if (Array.isArray(tweet.display_text_range)) {
    return [tweet.display_text_range[0], tweet.display_text_range[1]];
  }

  return [0, Array.from(tweet.text).length];
}

function hasQuotedTweet(tweet: TweetLike): tweet is TweetWithQuotedTweet {
  return "quoted_tweet" in tweet && Boolean(tweet.quoted_tweet);
}

export function normalizeTweetForEmbed<T extends TweetLike>(tweet: T): T {
  const normalizedTweet = {
    ...tweet,
    display_text_range: getDisplayTextRange(tweet),
    entities: {
      hashtags: getEntityArray(tweet.entities?.hashtags),
      media: Array.isArray(tweet.entities?.media)
        ? tweet.entities.media
        : undefined,
      symbols: getEntityArray(tweet.entities?.symbols),
      urls: getEntityArray(tweet.entities?.urls),
      user_mentions: getEntityArray(tweet.entities?.user_mentions),
    },
  };

  return {
    ...normalizedTweet,
    quoted_tweet: hasQuotedTweet(tweet)
      ? normalizeTweetForEmbed(tweet.quoted_tweet)
      : undefined,
  } as T;
}

/**
 * Fetches a post from X's syndication API, cached for a day. Errors aren't
 * cached, so a failed fetch retries on the next render.
 */
export async function getTweet(postId: string) {
  "use cache";
  cacheLife("days");

  const { data } = await fetchTweet(postId);
  return data;
}

/** Renders the post as static HTML with react-tweet, so no X script loads. */
async function XPostContent({ postId, caption }: XPostBlockType) {
  if (!postId) {
    return null;
  }

  const contentPaddingClassName = caption ? "p-3" : "px-4 pt-4 pb-0";
  const tweet = await getTweet(postId).catch(() => undefined);
  const normalizedTweet = tweet ? normalizeTweetForEmbed(tweet) : null;

  return (
    <Card className="surface-block reveal-stagger-2 gap-0 overflow-hidden py-0 content-block">
      <CardContent
        className={cn("flex justify-center", contentPaddingClassName)}
      >
        <div className="xpost-embed w-full max-w-lg">
          {normalizedTweet ? (
            <EmbeddedTweet tweet={normalizedTweet} />
          ) : (
            <TweetNotFound />
          )}
        </div>
      </CardContent>

      {caption && (
        <CardFooter className="surface-caption sm:px-5 sm:py-3" dir="auto">
          <RichText
            className="surface-caption-text"
            content={caption}
            enableGutter={false}
            enableProse={false}
          />
        </CardFooter>
      )}
    </Card>
  );
}

export function XPostBlock(props: XPostBlockType) {
  if (!props.postId) {
    return null;
  }
  return (
    <Suspense
      fallback={
        <Card className="surface-block p-6 content-block">
          <p role="status">Loading X post…</p>
          <a
            href={`https://x.com/i/status/${props.postId}`}
            rel="noopener"
            target="_blank"
          >
            View on X
          </a>
        </Card>
      }
    >
      <XPostContent {...props} />
    </Suspense>
  );
}
