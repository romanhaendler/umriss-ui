/* A set that already names a zone, nested under another zone: every built-in
   instant entry follows the new zone, an application's own entry stays.

   Time zone of the run: Europe/Berlin (vitest.config.ts). */

import { expect, it } from "vitest";
import { DEFAULT_FORMATS, mergeLanguage } from "../src";

const AT = new Date("2026-03-17T03:30:00Z");

it("moves a zoned set to another zone", () => {
  const tokyo = mergeLanguage({ formats: { ...DEFAULT_FORMATS, timeZone: "Asia/Tokyo" } }).formats;
  const york = mergeLanguage({ formats: { ...tokyo, timeZone: "America/New_York" } }).formats;
  expect(tokyo.time(AT, false)).toBe("12:30");
  expect(york.time(AT, false)).toBe("23:30");
  expect(york.date(AT)).toBe("16/03/2026");
});

it("keeps an entry the application wrote", () => {
  const own = () => "mine";
  const tokyo = mergeLanguage({ formats: { ...DEFAULT_FORMATS, date: own, timeZone: "Asia/Tokyo" } }).formats;
  const york = mergeLanguage({ formats: { ...tokyo, timeZone: "America/New_York" } }).formats;
  expect(york.date(AT)).toBe("mine");
  expect(york.time(AT, false)).toBe("23:30");
});
