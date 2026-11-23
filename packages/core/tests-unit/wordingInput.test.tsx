/* What a caller hands in as wording is a part: one overridden key, a complete
   object and the German file all compile, a key that does not exist does not
   (`tsc` checks the `@ts-expect-error` line). */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DEFAULT_WORDING, UmrissProvider, useWording } from "../src";
import type { LanguageOptions, Wording } from "../src";
import { GERMAN_WORDING } from "../src/lib/language/de";

const Probe = () => <span data-testid="p">{useWording().clear}</span>;

describe("Wording handed in as a part", () => {
  it("takes one key or a complete wording, and refuses a key that does not exist", () => {
    const complete: Wording = { ...DEFAULT_WORDING, clear: "Whole" };
    const accepted: LanguageOptions[] = [{ wording: { clear: "Part" } }, { wording: complete }, { wording: GERMAN_WORDING }];
    // @ts-expect-error a key the wording does not have
    const refused: LanguageOptions = { wording: { noSuchKey: "x" } };
    expect(accepted).toHaveLength(3);
    expect(refused).toBeDefined();
  });

  it("merges the one key over the default", () => {
    render(
      <UmrissProvider language={{ wording: { clear: "Part" } }}>
        <Probe />
      </UmrissProvider>,
    );
    expect(screen.getByTestId("p").textContent).toBe("Part");
  });
});
