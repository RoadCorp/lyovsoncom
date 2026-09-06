import type React from "react";

import { Code } from "./Code";

export interface CodeBlockProps {
  blockType: "code";
  code: string;
  language?: string | null;
}

type Props = CodeBlockProps & {
  className?: string;
};

export const CodeBlock: React.FC<Props> = ({ className, code, language }) => {
  return (
    <div className={[className, "content-block"].filter(Boolean).join(" ")}>
      <Code code={code} language={language ?? undefined} />
    </div>
  );
};
