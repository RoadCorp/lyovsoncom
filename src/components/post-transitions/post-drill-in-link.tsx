import type { AppLinkProps } from "@/components/app-link";
import { IntentLink } from "@/components/intent-link";
import { transitionTypes } from "@/utilities/routes";

export function PostDrillInLink(
  props: Omit<AppLinkProps, "prefetch" | "transitionTypes">
) {
  return (
    <IntentLink {...props} transitionTypes={[transitionTypes.postDrillIn]} />
  );
}
