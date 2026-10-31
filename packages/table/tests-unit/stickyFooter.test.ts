/* The footer of totals sticks to the scroll area's bottom under a sticky head, as
   the head sticks to the top. Layout is not computed in jsdom, so this reads the
   stylesheet; the scrolling itself was measured in Chromium. */

import { describe, expect, it } from "vitest";
import CSS from "../src/Table.module.css?raw";

const start = CSS.lastIndexOf("@media print");

describe("The sticky footer", () => {
  it("sticks to the bottom under a sticky head", () => {
    expect(CSS.slice(0, start)).toMatch(/\.sticky tfoot \.td\s*\{[^}]*position:\s*sticky;[^}]*bottom:\s*0/);
  });

  it("is back in the flow on paper", () => {
    expect(CSS.slice(start)).toMatch(/\.sticky tfoot \.td,[\s\S]*position:\s*static/);
  });
});
