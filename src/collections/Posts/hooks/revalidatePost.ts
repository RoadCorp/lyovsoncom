import { revalidateContentHooks } from "@/collections/hooks/revalidateContent";

export const { afterChange: revalidatePost, afterDelete: revalidateDelete } =
  revalidateContentHooks("posts");
