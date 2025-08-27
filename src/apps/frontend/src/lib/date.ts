import { DateTime } from "luxon";

export function formatDateTime(isoString: string): string {
  const dt = DateTime.fromISO(isoString);
  if (!dt.isValid) return isoString;
  const locale = typeof navigator !== "undefined" ? navigator.language : "en";
  return dt
    .setLocale(locale)
    .toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
}
