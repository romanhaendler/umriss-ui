import type { Wording } from "./language";

/**
 * A span as hours and minutes from the wording's short units ("1 hr 30 min").
 * The span is rounded to the whole minute, so 1 h 29 min 40 s reads as
 * 1 hr 30 min everywhere; a span of no minutes reads "0 min", a negative one
 * as its size. With `days` the whole days lead and the hours stay below 24.
 */
export function formatDuration(ms: number, wording: Wording, options: { days?: boolean } = {}): string {
  const total = Math.round(Math.abs(ms) / 60_000);
  const days = options.days ? Math.floor(total / 1440) : 0;
  const hours = Math.floor((total - days * 1440) / 60);
  const minutes = total % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(wording.days(days));
  if (hours > 0) parts.push(wording.hoursShort(hours));
  if (minutes > 0 || parts.length === 0) parts.push(wording.minutesShort(minutes));
  return parts.join(" ");
}
