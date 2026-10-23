import { EmbeddedTweet, TweetNotFound } from "react-tweet";
import { fetchTweet } from "react-tweet/api";
import { BlockPreview } from "@/components/admin/block-preview";
import { BlockPreviewCaption } from "@/components/admin/block-preview-caption";
import type { XPostBlock } from "@/payload-types";
import { normalizeTweetForEmbed } from "./component";

export async function XPostPreview({
  siblingData,
}: {
  siblingData?: Partial<XPostBlock>;
}) {
  const postId = siblingData?.postId;
  const tweet = postId
    ? await fetchTweet(postId)
        .then((result) => result.data)
        .catch(() => undefined)
    : undefined;

  let body = <p className="block-preview__empty">Add an X post ID.</p>;
  if (tweet) {
    body = <EmbeddedTweet tweet={normalizeTweetForEmbed(tweet)} />;
  } else if (postId) {
    body = <TweetNotFound />;
  }

  return (
    <BlockPreview>
      {body}
      <BlockPreviewCaption content={siblingData?.caption} />
    </BlockPreview>
  );
}
