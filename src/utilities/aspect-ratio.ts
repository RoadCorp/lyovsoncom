/**
 * Normalize aspect ratio to a CSS-compatible `aspect-ratio` value.
 * Accepts values like "1.7777", "16:9", or "16/9".
 */
export function normalizeAspectRatio(ratio: string): string {
  const normalizedRatio = ratio.trim();
  if (!normalizedRatio) {
    return "1 / 1";
  }

  let separator: ":" | "/" | null = null;
  if (normalizedRatio.includes(":")) {
    separator = ":";
  } else if (normalizedRatio.includes("/")) {
    separator = "/";
  }

  if (separator) {
    const [widthPart, heightPart] = normalizedRatio.split(separator);
    const width = Number.parseFloat(widthPart || "");
    const height = Number.parseFloat(heightPart || "");

    if (
      Number.isFinite(width) &&
      Number.isFinite(height) &&
      width > 0 &&
      height > 0
    ) {
      return `${width} / ${height}`;
    }

    return "1 / 1";
  }

  const numericRatio = Number.parseFloat(normalizedRatio);
  if (Number.isFinite(numericRatio) && numericRatio > 0) {
    return String(numericRatio);
  }

  return "1 / 1";
}
