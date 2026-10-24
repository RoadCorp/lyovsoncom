import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
  StrikethroughFeature,
} from "@payloadcms/richtext-lexical";
import type { Config } from "payload";
import { Banner } from "@/blocks/Banner/config";
import { Code } from "@/blocks/Code/config";
import { GIF } from "@/blocks/GIF/config";
import { MediaBlock } from "@/blocks/MediaBlock/config";
import { Quote } from "@/blocks/Quote/config";
import { XPost } from "@/blocks/XPost/config";
import { YouTube } from "@/blocks/YouTube/config";

/**
 * Shared Lexical Editor Configurations
 *
 * This file provides reusable, pre-configured Lexical editor setups that can be
 * imported and used across different collections. This approach ensures consistency
 * and makes it easy to add new features - just update the config here and all
 * collections inherit the changes.
 *
 * @example
 * ```typescript
 * // In your collection config:
 * import { richEditorConfig } from '@/fields/lexical-configs';
 *
 * fields: [
 *   {
 *     name: 'content',
 *     type: 'richText',
 *     editor: richEditorConfig,
 *   }
 * ]
 * ```
 */

/**
 * Full-featured rich text editor configuration
 *
 * **Used for:** Posts, long-form articles, blog content
 *
 * **Features:**
 * - Text formatting: Bold, Italic, Underline, Strikethrough (inherited from rootFeatures)
 * - Headings: h1, h2, h3, h4
 * - Custom blocks: Banner, Code, MediaBlock, YouTube, XPost, Quote, GIF
 * - Toolbars: Fixed (persistent) and Inline (selection-based)
 * - Horizontal rules for visual separation
 *
 * **Keyboard Shortcuts:**
 * - Bold: Ctrl/Cmd + B
 * - Italic: Ctrl/Cmd + I
 * - Underline: Ctrl/Cmd + U
 * - Strikethrough: Ctrl/Cmd + Shift + S
 * - Insert block: Type "/" to open slash menu
 *
 * @see {@link https://payloadcms.com/docs/rich-text/lexical Payload Lexical Docs}
 */
export const richEditorConfig: Config["editor"] = lexicalEditor({
  features: ({ rootFeatures }) => {
    return [
      ...rootFeatures,
      StrikethroughFeature(),
      HeadingFeature({
        enabledHeadingSizes: ["h1", "h2", "h3", "h4"],
      }),
      BlocksFeature({
        blocks: [Banner, Code, MediaBlock, YouTube, XPost, Quote, GIF],
      }),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
      HorizontalRuleFeature(),
    ];
  },
});

/**
 * Bio/Profile editor configuration
 *
 * **Used for:** User profiles, team member bios, about pages
 *
 * **Features:**
 * - Text formatting: Bold, Italic, Underline, Strikethrough (inherited from rootFeatures)
 * - Section headings: h2, h3, h4 (no h1 to maintain semantic hierarchy)
 * - Media blocks: Images, YouTube videos, Quotes
 * - Toolbars: Fixed (persistent) and Inline (selection-based)
 * - Horizontal rules for section breaks
 *
 * **Why no h1?**
 * The h1 is typically the person's name at the page level, so bio content
 * should use h2-h4 for proper document structure.
 *
 * **Keyboard Shortcuts:**
 * - Bold: Ctrl/Cmd + B
 * - Italic: Ctrl/Cmd + I
 * - Underline: Ctrl/Cmd + U
 * - Strikethrough: Ctrl/Cmd + Shift + S
 * - Insert media: Type "/" to open slash menu
 *
 * @see {@link https://payloadcms.com/docs/rich-text/lexical Payload Lexical Docs}
 */
export const bioEditorConfig: Config["editor"] = lexicalEditor({
  features: ({ rootFeatures }) => {
    return [
      ...rootFeatures,
      StrikethroughFeature(),
      HeadingFeature({
        enabledHeadingSizes: ["h2", "h3", "h4"],
      }),
      BlocksFeature({
        blocks: [MediaBlock, YouTube, Quote],
      }),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
      HorizontalRuleFeature(),
    ];
  },
});

// Type exports for better IDE autocomplete and type checking
export type RichEditorConfig = typeof richEditorConfig;
export type BioEditorConfig = typeof bioEditorConfig;
