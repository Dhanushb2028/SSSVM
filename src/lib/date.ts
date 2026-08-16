import { format } from "date-fns";

/**
 * Formats a calendar-only date (no time-of-day meaning — e.g. academic year
 * start/end, DOB, admission date) using its UTC year/month/day. These are
 * stored as UTC midnight; formatting them with the server's local timezone
 * (as `date-fns`'s `format` does) can roll the displayed day backward or
 * forward by one depending on the server's offset from UTC.
 */
export function formatDateOnly(date: Date | string, fmt: string) {
  const d = new Date(date);
  const utcNoon = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12));
  return format(utcNoon, fmt);
}
