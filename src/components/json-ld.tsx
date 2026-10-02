// Reusable JSON-LD component for structured data
// Handles hydration issues in Next.js App Router

import type { JsonLdProps } from "@/types/schema";

export function JsonLd({ data }: JsonLdProps) {
  const serialized = JSON.stringify(data);
  return (
    <script suppressHydrationWarning type="application/ld+json">
      {serialized}
    </script>
  );
}
