import type { AppLinkProps } from "@/components/AppLink";
import { IntentLink } from "@/components/IntentLink";
import { transitionTypes } from "@/utilities/routes";

export function PostDrillInLink(
  props: Omit<AppLinkProps, "prefetch" | "transitionTypes">
) {
  return (
    <IntentLink {...props} transitionTypes={[transitionTypes.postDrillIn]} />
  );
}
