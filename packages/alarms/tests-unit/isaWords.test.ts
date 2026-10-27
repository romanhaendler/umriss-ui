/* The package says ISA's words: no key in either wording uses the API's general words. */

import { describe, expect, it } from "vitest";
import { DEFAULT_WORDING } from "@umriss-ui/core";
import { GERMAN_WORDING } from "@umriss-ui/core/wording/de";

const texts = (wording: object): string[] =>
  Object.entries(wording)
    .filter(([key]) => key.startsWith("alarm"))
    .map(([, value]) => (typeof value === "function" ? (value as (...a: unknown[]) => string)(3, "M. Weber", "valve") : String(value)));

describe("the alarm wording", () => {
  it("English avoids snooze, disabled, hidden and resolved", () => {
    for (const text of texts(DEFAULT_WORDING)) expect(text).not.toMatch(/snooz|disabled|hidden|resolved/i);
  });
  it("German avoids Deaktiviert, Ausgeblendet and Behoben", () => {
    for (const text of texts(GERMAN_WORDING)) expect(text).not.toMatch(/deaktiviert|ausgeblendet|behoben/i);
  });
  it("says the states in ISA's words", () => {
    expect(DEFAULT_WORDING.alarmHidden(3)).toBe("Suppressed or shelved: 3");
    expect(DEFAULT_WORDING.alarmAvailabilitySnoozed("14:05", "M. Weber", "valve being replaced")).toBe("Shelved until 14:05 by M. Weber: valve being replaced");
    expect(GERMAN_WORDING.alarmList).toBe("Alarme");
  });
});
