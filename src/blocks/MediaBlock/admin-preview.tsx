import Image from "next/image";
import type { PayloadRequest } from "payload";
import { BlockPreview } from "@/components/admin/block-preview";
import { BlockPreviewCaption } from "@/components/admin/block-preview-caption";
import type { Media, MediaBlock } from "@/payload-types";

export async function MediaBlockPreview({
  req,
  siblingData,
}: {
  req: PayloadRequest;
  siblingData?: Partial<MediaBlock>;
}) {
  const media = siblingData?.media;
  // The editor's form state holds the relation as an ID.
  const doc: Media | null =
    typeof media === "number"
      ? await req.payload
          .findByID({ collection: "media", depth: 0, id: media, req })
          .catch(() => null)
      : (media ?? null);

  return (
    <BlockPreview>
      {doc?.url && doc.width && doc.height ? (
        <div className="block-preview__frame">
          <Image
            alt={doc.alt ?? ""}
            height={doc.height}
            sizes="560px"
            src={doc.url}
            width={doc.width}
          />
        </div>
      ) : (
        <p className="block-preview__empty">Choose an image.</p>
      )}
      <BlockPreviewCaption content={doc?.caption} />
    </BlockPreview>
  );
}
