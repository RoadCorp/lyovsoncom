import { revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook } from "payload";

export const revalidateRedirects: CollectionAfterChangeHook = ({
  doc,
  req: { payload },
}) => {
  payload.logger.info("Updating cache for redirects");

  // Payload hooks are not Server Actions, so use tag revalidation here.
  revalidateTag("redirects", { expire: 0 });

  return doc;
};
