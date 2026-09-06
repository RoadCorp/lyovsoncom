import { normalizeTokens, Prism, type PrismTheme } from "prism-react-renderer";
import { CopyButton } from "./CopyButton";

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

export function Code({
  code,
  language = "",
}: {
  code: string;
  language?: string;
}) {
  if (!code) {
    return null;
  }
  const grammar = Prism.languages[language];
  const tokens = normalizeTokens(
    grammar ? Prism.tokenize(code, grammar) : [code]
  );
  let offset = 0;
  const lines = tokens.map((line, index) => {
    const lineOffset = offset;
    const spans = line.map((token) => {
      const tokenOffset = offset;
      offset += token.content.length || 1;
      return { ...token, offset: tokenOffset };
    });
    offset += 1;
    return { offset: lineOffset, number: index + 1, spans };
  });
  return (
    <div className="surface-panel surface-emphasis surface-code relative">
      {language && (
        <div className="surface-chip surface-code-chip absolute top-3 right-15 rounded px-2 py-1 font-medium text-xs">
          {language.toUpperCase()}
        </div>
      )}
      <pre
        className="rounded-lg p-6 font-mono text-sm leading-relaxed content-code-shell"
        style={codeTheme.plain}
      >
        <code>
          {lines.map((line) => (
            <span className="table-row" key={line.offset}>
              <span
                aria-hidden="true"
                className="tone-muted table-cell min-w-[3rem] select-none pr-4 text-right"
              >
                {line.number}
              </span>
              <span className="table-cell">
                {line.spans.map((token) => (
                  <span
                    key={token.offset}
                    style={
                      codeTheme.styles.find((rule) =>
                        token.types.some((type) => rule.types.includes(type))
                      )?.style
                    }
                  >
                    {token.content}
                  </span>
                ))}
                {"\n"}
              </span>
            </span>
          ))}
        </code>
      </pre>
      <CopyButton code={code} />
    </div>
  );
}
