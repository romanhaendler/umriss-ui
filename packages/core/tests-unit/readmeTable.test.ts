/* The guard over the README's component table (library-audit 08).

   What is checked is the reader against small texts, not the real README -
   `pnpm typecheck` does that through `pretypecheck`, and a second run here
   would need the compiler's whole program.

   The fixture below is English, like the shipped README since ticket 14. The
   one thing it may not change is the heading the reader searches for -
   `## Components` - which is the README's own: the two move together, or this
   check finds no section and reports every component as missing. */

import { describe, expect, it } from "vitest";
import { missingRows, namesInTheTable } from "../demo/tooling/readmeTable";

const README = `# Package

## Components (v1.0)

| Component | Purpose |
| --- | --- |
| \`Button\` | variants |
| \`Modal\` / \`ModalHeader\` | dialogs; mentions \`Aside\` in the purpose only |

## Principles

| \`Outside\` | stands in another section |
`;

describe("namesInTheTable", () => {
  it("reads every name of the first column, several per row included", () => {
    expect([...namesInTheTable(README)]).toEqual(["Button", "Modal", "ModalHeader"]);
  });

  it("reads neither the second column nor the tables of other sections", () => {
    const names = namesInTheTable(README);
    expect(names.has("Aside")).toBe(false);
    expect(names.has("Outside")).toBe(false);
  });
});

describe("missingRows", () => {
  it("names every component without a row", () => {
    expect(missingRows(README, ["Button", "Modal", "Popover", "TreeView"])).toEqual(["Popover", "TreeView"]);
  });

  it("names nothing where every one has a row", () => {
    expect(missingRows(README, ["ModalHeader", "Button"])).toEqual([]);
  });
});
