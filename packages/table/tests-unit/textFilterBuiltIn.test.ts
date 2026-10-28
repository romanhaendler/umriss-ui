/* The built-in text filter used on its own - `describe`, an absent value -
   speaks the wording and the locale, not fixed English and "en". */

import { describe, expect, it } from "vitest";
import { DEFAULT_WORDING } from "@umriss-ui/core";
import { filterOf, satisfies } from "../src/columnFilter";

const text = filterOf("text")!;
const formats = (locale: string) => ({ locale }) as Parameters<typeof satisfies>[3];

describe("The built-in text filter", () => {
  it("describes a condition in the wording, not by operator names", () => {
    expect(text.describe({ join: "or", terms: [{ operator: "contains", value: "a" }, { operator: "isEmpty" }] })).toBe(
      `${DEFAULT_WORDING.textTerm(DEFAULT_WORDING.textContains, "a")} ${DEFAULT_WORDING.textOr} ${DEFAULT_WORDING.textIsEmpty}`,
    );
  });

  it("lowers case by the formats' locale", () => {
    const condition = { terms: [{ operator: "equals", value: "I" }] };
    expect(satisfies(text, "ı", condition, formats("tr"))).toBe(true);
    expect(satisfies(text, "ı", condition, formats("en"))).toBe(false);
    expect(satisfies(text, null, { terms: [{ operator: "isEmpty" }] }, formats("tr"))).toBe(true);
  });
});
