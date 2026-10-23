/** Doctor Tracker: Contains shared date, name-initial, and number formatting helpers. */
/** Format a date for display, using a dash for missing or invalid values. */
export function formatDate(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

/** Return initials from the first two words, with a stable fallback. */
export function initials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "A";
}

/** Apply the browser's English number grouping for dashboard totals. */
export function formatNumber(value: number) {
  return new Intl.NumberFormat("en").format(value);
}
