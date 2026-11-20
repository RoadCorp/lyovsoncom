import { cn } from "@/lib/utils";
import type { NodeTypes } from "./serialize";
import { serializeLexical } from "./serialize";

interface Props {
  className?: string;
  content: unknown;
  enableGutter?: boolean;
  enableProse?: boolean;
}

function getLexicalNodes(
  content: unknown
): Array<NodeTypes | null | undefined> | null {
  if (!content || Array.isArray(content) || typeof content !== "object") {
    return null;
  }

  if (
    !("root" in content && content.root) ||
    typeof content.root !== "object"
  ) {
    return null;
  }

  if (!("children" in content.root && Array.isArray(content.root.children))) {
    return null;
  }

  return content.root.children as Array<NodeTypes | null | undefined>;
}

const RichText = ({
  className,
  content,
  enableGutter = true,
  enableProse = true,
}: Props) => {
  if (!content) {
    return null;
  }

  const nodes = getLexicalNodes(content);
  const serializedContent = nodes ? serializeLexical({ nodes }) : null;

  return (
    <div
      className={cn(
        {
          container: enableGutter,
          "max-w-none": !enableGutter,
          "content-measure content-prose mx-auto": enableProse,
        },
        className
      )}
    >
      {serializedContent}
    </div>
  );
};

export default RichText;
