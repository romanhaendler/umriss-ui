/* `touch-scale.css` wins over the tokens whatever the import order, and grows
   `sm` with `md` (ADR-0079). The rule stands in the tokens layer on `:root`, so
   it can only win by specificity: a doubled `:root`. Tabs read the control
   height like every `md` control. */

import { describe, expect, it } from "vitest";
import TOUCH from "../src/styles/touch-scale.css?raw";
import TABS from "../src/components/Tabs/Tabs.module.css?raw";

describe("touch-scale.css", () => {
  it("outranks the token rule by specificity, not by position", () => {
    expect(TOUCH).toMatch(/:root:root\s*\{/);
  });

  it("grows md and sm together, and leaves xs", () => {
    expect(TOUCH).toMatch(/--u-control-height:\s*2.75rem/);
    expect(TOUCH).toMatch(/--u-control-height-sm:\s*2.75rem/);
    expect(TOUCH).not.toMatch(/--u-control-height-xs/);
  });

  it("stays inside the tokens layer and the coarse-pointer query", () => {
    expect(TOUCH).toMatch(/@layer umriss\.tokens/);
    expect(TOUCH).toMatch(/@media \(pointer: coarse\)/);
  });
});

describe("Tabs", () => {
  it("is at least as tall as a md control", () => {
    expect(TABS).toMatch(/\.tab \{[^}]*min-height:\s*var\(--u-control-height\)/);
  });
});
