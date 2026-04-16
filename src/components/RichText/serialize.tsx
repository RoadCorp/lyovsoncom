import type {
  DefaultNodeTypes,
  SerializedBlockNode,
} from "@payloadcms/richtext-lexical";
import React, { type JSX } from "react";
import { BannerBlock } from "@/blocks/Banner/Component";
import { CodeBlock, type CodeBlockProps } from "@/blocks/Code/Component";
import { GIFBlock } from "@/blocks/GIF/Component";
import type { GIFBlock as GIFBlockProps } from "@/blocks/GIF/types";
import { MediaBlock } from "@/blocks/MediaBlock/Component";
import { QuoteBlock } from "@/blocks/Quote/Component";
import { XPostBlock } from "@/blocks/XPost/Component";
import { YouTubeBlock } from "@/blocks/YouTube/Component";
import { CMSLink } from "@/components/Link";
import type {
  BannerBlock as BannerBlockProps,
  MediaBlock as MediaBlockProps,
  QuoteBlock as QuoteBlockProps,
  XPostBlock as XPostBlockProps,
  YouTubeBlock as YouTubeBlockProps,
} from "@/payload-types";
import {
  IS_BOLD,
  IS_CODE,
  IS_ITALIC,
  IS_STRIKETHROUGH,
  IS_SUBSCRIPT,
  IS_SUPERSCRIPT,
  IS_UNDERLINE,
} from "./nodeFormat";

export type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<
      | MediaBlockProps
      | BannerBlockProps
      | CodeBlockProps
      | YouTubeBlockProps
      | XPostBlockProps
      | QuoteBlockProps
      | GIFBlockProps
    >;

interface Props {
  nodes: Array<NodeTypes | null | undefined>;
  path?: string;
}

type RichTextBlock =
  | MediaBlockProps
  | BannerBlockProps
  | CodeBlockProps
  | YouTubeBlockProps
  | XPostBlockProps
  | QuoteBlockProps
  | GIFBlockProps;

function hasChildren(
  node: NodeTypes
): node is NodeTypes & { children: NodeTypes[] } {
  return "children" in node && Array.isArray(node.children);
}

function getUnknownBlockType(block: unknown): string {
  if (
    block &&
    typeof block === "object" &&
    "blockType" in block &&
    typeof block.blockType === "string"
  ) {
    return block.blockType;
  }

  return "unknown";
}

function getObjectId(value: unknown): string | null {
  if (!(value && typeof value === "object" && "id" in value)) {
    return null;
  }

  const id = value.id;
  if (typeof id === "string" || typeof id === "number") {
    return String(id);
  }

  return null;
}

function sanitizeKeySegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getNodeKeyBase(node: NodeTypes): string {
  if (node.type === "text") {
    const textSample = sanitizeKeySegment(node.text.slice(0, 24));
    return `text-${textSample || "empty"}-${node.format ?? 0}`;
  }

  if (node.type === "block") {
    const blockType = getUnknownBlockType(node.fields);
    const blockId = getObjectId(node.fields);
    if (blockId) {
      return `block-${blockType}-${blockId}`;
    }
    return `block-${blockType}`;
  }

  if (node.type === "heading") {
    return `heading-${node.tag}`;
  }

  if (node.type === "list") {
    return `list-${node.tag}-${node.listType ?? "default"}`;
  }

  if (node.type === "listitem") {
    return `listitem-${node.value ?? "na"}-${node.checked ?? "na"}`;
  }

  if (node.type === "link") {
    const externalUrl =
      node.fields.linkType === "custom" && node.fields.url
        ? sanitizeKeySegment(node.fields.url)
        : "internal";
    return `link-${externalUrl || "empty"}`;
  }

  return node.type;
}

function isRichTextBlock(block: unknown): block is RichTextBlock {
  if (!(block && typeof block === "object" && "blockType" in block)) {
    return false;
  }

  const blockType = block.blockType;

  return (
    blockType === "mediaBlock" ||
    blockType === "banner" ||
    blockType === "code" ||
    blockType === "youtube" ||
    blockType === "xpost" ||
    blockType === "quote" ||
    blockType === "gif"
  );
}

function serializeTextNode(
  node: Extract<NodeTypes, { type: "text" }>
): JSX.Element {
  const format = node.format ?? 0;
  let text: JSX.Element = <>{node.text}</>;

  if (format & IS_BOLD) {
    text = <strong>{text}</strong>;
  }
  if (format & IS_ITALIC) {
    text = <em>{text}</em>;
  }
  if (format & IS_STRIKETHROUGH) {
    text = <span className="line-through">{text}</span>;
  }
  if (format & IS_UNDERLINE) {
    text = <span className="underline">{text}</span>;
  }
  if (format & IS_CODE) {
    text = <code className="content-inline-code">{node.text}</code>;
  }
  if (format & IS_SUBSCRIPT) {
    text = <sub>{text}</sub>;
  }
  if (format & IS_SUPERSCRIPT) {
    text = <sup>{text}</sup>;
  }

  return text;
}

function normalizeChildren(node: NodeTypes): NodeTypes[] | null {
  if (!hasChildren(node)) {
    return null;
  }

  const children = node.children as NodeTypes[];

  if (node.type !== "list" || node.listType !== "check") {
    return children;
  }

  return children.map((child) => {
    if (child.type === "listitem" && child.checked == null) {
      return { ...child, checked: false };
    }

    return child;
  });
}

function serializeChildren(node: NodeTypes, path: string): JSX.Element | null {
  const children = normalizeChildren(node);
  if (children == null) {
    return null;
  }

  return serializeLexical({
    nodes: children,
    path: `${path}-children`,
  });
}

function renderRichTextBlock(
  block: RichTextBlock,
  key: string
): JSX.Element | null {
  switch (block.blockType) {
    case "mediaBlock":
      return (
        <MediaBlock
          imgClassName="m-0 w-full rounded-lg"
          key={key}
          {...block}
          captionClassName="mx-auto max-w-[48rem] tone-muted text-center"
          disableInnerContainer={true}
          enableGutter={false}
        />
      );
    case "banner":
      return <BannerBlock className="reveal-stagger-2" key={key} {...block} />;
    case "code":
      return (
        <CodeBlock
          className="reveal-stagger-2 font-mono"
          key={key}
          {...block}
        />
      );
    case "youtube":
      return <YouTubeBlock key={key} {...block} />;
    case "xpost":
      return <XPostBlock key={key} {...block} />;
    case "quote":
      return <QuoteBlock className="reveal-stagger-2" key={key} {...block} />;
    case "gif":
      return <GIFBlock key={key} {...block} />;
    default:
      return null;
  }
}

function renderUnsupportedBlock(block: unknown, key: string): JSX.Element {
  const blockType = getUnknownBlockType(block);

  return (
    <div className="surface-panel rounded-lg p-4 content-block" key={key}>
      <p className="tone-muted text-sm">
        Unsupported content block: {blockType}
      </p>
    </div>
  );
}

function renderElementNode(
  node: Exclude<NodeTypes, { type: "block" } | { type: "text" }>,
  key: string,
  serializedChildren: JSX.Element | null
): JSX.Element | null {
  switch (node.type) {
    case "linebreak":
      return <br key={key} />;
    case "paragraph":
      return <p key={key}>{serializedChildren}</p>;
    case "heading": {
      const Tag = node.tag;
      return <Tag key={key}>{serializedChildren}</Tag>;
    }
    case "list": {
      const Tag = node.tag;
      return <Tag key={key}>{serializedChildren}</Tag>;
    }
    case "listitem":
      if (node.checked != null) {
        return (
          <li
            className={
              node.checked
                ? "line-through opacity-65 content-checklist-item"
                : "content-checklist-item"
            }
            key={key}
            value={node.value}
          >
            <span className="mr-2 text-xs">{node.checked ? "[x]" : "[ ]"}</span>
            {serializedChildren}
          </li>
        );
      }

      return (
        <li key={key} value={node.value}>
          {serializedChildren}
        </li>
      );
    case "quote":
      return <blockquote key={key}>{serializedChildren}</blockquote>;
    case "link": {
      const isInternalLink = node.fields.linkType === "internal";

      return (
        <CMSLink
          className="transition-colors duration-300 hover:opacity-90"
          key={key}
          newTab={Boolean(node.fields.newTab)}
          reference={isInternalLink ? node.fields.doc : null}
          type={isInternalLink ? "reference" : "custom"}
          url={node.fields.url}
        >
          {serializedChildren}
        </CMSLink>
      );
    }
    default:
      return null;
  }
}

function serializeNode(node: NodeTypes, key: string): JSX.Element | null {
  if (node.type === "text") {
    return <React.Fragment key={key}>{serializeTextNode(node)}</React.Fragment>;
  }

  const serializedChildren = serializeChildren(node, key);

  if (node.type === "block") {
    if (!isRichTextBlock(node.fields)) {
      return renderUnsupportedBlock(node.fields, key);
    }

    return renderRichTextBlock(node.fields, key);
  }

  return renderElementNode(node, key, serializedChildren);
}

export function serializeLexical({ nodes, path = "root" }: Props): JSX.Element {
  const keyCounts = new Map<string, number>();
  const serializedNodes = nodes.map((node) => {
    if (!node) {
      return null;
    }

    const baseKey = getNodeKeyBase(node);
    const keyCount = (keyCounts.get(baseKey) ?? 0) + 1;
    keyCounts.set(baseKey, keyCount);

    const key = `${path}-${baseKey}-${keyCount}`;
    return serializeNode(node, key);
  });

  return <>{serializedNodes}</>;
}
