/* What a sheet of paper gets of the components: what opens above the page is
   left off it, and the shadows give way to hard edges. A browser lays out
   print only in a real print, so this reads the stylesheets; the sheets
   themselves were looked at in Chromium's PDF output. */

import { describe, expect, it } from "vitest";
import TOKENS from "../src/styles/tokens.css?raw";
import OWN from "../../../scripts/styles/own.module.css?raw";

const STYLES = import.meta.glob("../src/components/**/*.module.css", { query: "?raw", import: "default", eager: true }) as Record<
  string,
  string
>;

/** The text of every `@media print { … }` block of a stylesheet. */
function printBlocks(css: string): string[] {
  const blocks: string[] = [];
  for (let at = css.indexOf("@media print"); at !== -1; at = css.indexOf("@media print", at + 1)) {
    let depth = 0;
    let end = css.indexOf("{", at);
    const start = end;
    for (; end < css.length; end++) {
      if (css[end] === "{") depth++;
      if (css[end] === "}" && --depth === 0) break;
    }
    blocks.push(css.slice(start + 1, end));
  }
  return blocks;
}

const OVERLAYS: ReadonlyArray<readonly [string, string]> = [
  ["Toast/Toast", ".region"],
  ["Modal/Modal", ".dialog"],
  ["Popover/Popover", ".panel"],
  ["Tooltip/Tooltip", ".tooltip"],
  ["MultiSelect/MultiSelect", ".panel"],
  ["DatePicker/DatePicker", ".panel"],
  ["CommandPalette/CommandPalette", ".dialog"],
];

describe("Print", () => {
  it.each(OVERLAYS)("leaves %s's overlay off the sheet", (file, selector) => {
    const css = STYLES[`../src/components/${file}.module.css`]!;
    const rule = new RegExp(`${selector.replace(".", "\\.")}\\s*\\{[^}]*display:\\s*none`);
    expect(printBlocks(css).some((block) => rule.test(block))).toBe(true);
  });

  it("leaves a focused skip link off the sheet", () => {
    const css = STYLES["../src/components/VisuallyHidden/VisuallyHidden.module.css"]!;
    expect(printBlocks(css).join("\n")).toMatch(/\.focusable:focus[^{]*\{[^}]*display:\s*none/);
  });

  it("gives cards and overlays a hard edge instead of a shadow, and the edges a colour that survives a sheet", () => {
    const [block] = printBlocks(TOKENS);
    expect(block).toMatch(/--u-shadow-card:\s*var\(--u-edge\)/);
    expect(block).toMatch(/--u-shadow-overlay:\s*var\(--u-edge\)/);
    expect(block).toMatch(/--u-edge-color:\s*#/);
  });

  it("prints every surface that carries the text context in the light theme", () => {
    expect(printBlocks(OWN).join("\n")).toMatch(/\.text\s*\{[^}]*color-scheme:\s*light/);
  });
});
