const SHORT_DATE_FORMAT = {
  year: "2-digit",
  month: "short",
  day: "2-digit",
} as const;

export function formatShortDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-GB", SHORT_DATE_FORMAT);
}
