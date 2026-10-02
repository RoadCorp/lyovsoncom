import { revalidateContentHooks } from "@/collections/hooks/revalidate-content";

export const { afterChange: revalidatePost, afterDelete: revalidateDelete } =
  revalidateContentHooks("posts");
