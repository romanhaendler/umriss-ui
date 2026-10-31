/* Where the group separator is a space (fr, sv), a space after a leading zero is refused as "0,5" is under en. */

import { describe, expect, it } from "vitest";
import { isReadable, parseNumber } from "../src/components/NumberInput/number";
import type { Separators } from "../src/lib/language/formats";

const FR: Separators = { group: " ", decimal: "," };
const SV: Separators = { group: " ", decimal: "," };

describe("a space as the group separator", () => {
  for (const [name, sep] of [["fr", FR], ["sv", SV]] as const) {
    it(`refuses "0 5" under ${name}`, () => {
      expect(isReadable("0 5", sep)).toBe(false);
      expect(parseNumber("0 5", sep)).toBeNull();
      expect(isReadable(`0${sep.group}5`, sep)).toBe(false);
    });
    it(`reads groups, a typed plain space and surrounding spaces under ${name}`, () => {
      expect(parseNumber(`1${sep.group}234,5`, sep)).toBe(1234.5);
      expect(parseNumber("1 234", sep)).toBe(1234);
      expect(parseNumber("  42 ", sep)).toBe(42);
      expect(parseNumber("0,5", sep)).toBe(0.5);
    });
  }
});
