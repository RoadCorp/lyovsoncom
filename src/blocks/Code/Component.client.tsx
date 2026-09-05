"use client";
import { Highlight, type PrismTheme } from "prism-react-renderer";
import type React from "react";

import { CopyButton } from "./CopyButton";

interface Props {
  code: string;
  language?: string;
}

const codeTheme: PrismTheme = {
  plain: { color: "var(--text-1)" },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: { color: "var(--syntax-comment)" },
    },
    {
      types: ["keyword", "atrule", "tag", "selector"],
      style: { color: "var(--syntax-keyword)" },
    },
    {
      types: ["string", "char", "attr-value", "regex", "inserted"],
      style: { color: "var(--syntax-string)" },
    },
    {
      types: ["number", "boolean", "constant", "symbol", "deleted"],
      style: { color: "var(--syntax-number)" },
    },
    {
      types: ["function", "class-name", "builtin", "attr-name"],
      style: { color: "var(--syntax-function)" },
    },
    {
      types: ["punctuation", "operator"],
      style: { color: "var(--syntax-punctuation)" },
    },
  ],
};

export const Code: React.FC<Props> = ({ code, language = "" }) => {
  if (!code) {
    return null;
  }

  return (
    <div className="surface-panel surface-emphasis surface-code relative">
      <Highlight code={code} language={language} theme={codeTheme}>
        {({ getLineProps, getTokenProps, tokens }) => (
          <pre className="rounded-lg p-6 font-mono text-sm leading-relaxed content-code-shell">
            {/* Language indicator */}
            {language && (
              <div className="surface-chip surface-code-chip absolute top-3 right-15 rounded px-2 py-1 font-medium text-xs">
                {language.toUpperCase()}
              </div>
            )}

            {tokens.map((line, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Syntax highlighting tokens are static and ordered
              <div key={i} {...getLineProps({ className: "table-row", line })}>
                <span className="tone-muted table-cell min-w-[3rem] select-none pr-4 text-right">
                  {i + 1}
                </span>
                <span className="table-cell">
                  {line.map((token, key) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: Token positions are stable within a line
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            ))}
            <CopyButton code={code} />
          </pre>
        )}
      </Highlight>
    </div>
  );
};
