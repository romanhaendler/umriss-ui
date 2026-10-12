/* The residue rule (`scripts/residue.ts`) against two small built entries: one
   that shakes to nothing, one with a top-level call nobody marked pure.
   Runs in node: esbuild refuses jsdom's typed arrays.

   @vitest-environment node */

import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { residueOf } from "../../../scripts/residue.ts";

const SMALL_BUDGET = 40;
const entryOf = (source: string) => {
  const file = join(mkdtempSync(join(tmpdir(), "fixture-")), "entry.js");
  writeFileSync(file, source);
  return file;
};

describe("residueOf", () => {
  it("leaves nothing of an entry whose calls are marked pure", async () => {
    const { gzipped, kept } = await residueOf(
      entryOf(`import { createContext } from "react";\nexport const Context = /* @__PURE__ */ createContext(null);\nexport const answer = () => 42;\n`),
    );
    expect(kept).toEqual([]);
    expect(gzipped).toBeLessThanOrEqual(SMALL_BUDGET);
  });

  it("keeps an unmarked top-level call, names it and counts it over the budget", async () => {
    const { gzipped, kept } = await residueOf(entryOf(`import { createContext } from "react";\nexport const Context = createContext(null);\n`));
    expect(kept.map((statement) => statement.text).join("\n")).toContain("createContext(null)");
    expect(gzipped).toBeGreaterThan(SMALL_BUDGET);
  });
});
