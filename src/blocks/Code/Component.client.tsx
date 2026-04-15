"use client";
import { Highlight, themes } from "prism-react-renderer";
import type React from "react";

import { CopyButton } from "./CopyButton";

interface Props {
  code: string;
  language?: string;
}

export const Code: React.FC<Props> = ({ code, language = "" }) => {
  if (!code) {
    return null;
  }

  return (
    <div className="glass-section glass-premium relative">
      <Highlight code={code} language={language} theme={themes.vsDark}>
        {({ getLineProps, getTokenProps, tokens }) => (
          <pre className="glass-code-pre rounded-lg p-6 font-mono text-sm leading-relaxed">
            {/* Language indicator */}
            {language && (
              <div className="glass-badge absolute top-3 right-15 rounded px-2 py-1 font-medium text-xs">
                {language.toUpperCase()}
              </div>
            )}

            {tokens.map((line, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Syntax highlighting tokens are static and ordered
              <div key={i} {...getLineProps({ className: "table-row", line })}>
                <span className="glass-text-secondary table-cell min-w-[3rem] select-none pr-4 text-right opacity-50">
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
