/* The gate's second class: an export of the entry or a subpath without JSDoc
   (.scratch/api-index). Checked against two fixture packages - one with three
   bare exports, one with the same exports explained. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { undocumentedExports } from "../src/tooling/exportDocs";
import { generateProps } from "../src/tooling/props";

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "exports");
const BARE = join(FIXTURES, "bare");
const DOCUMENTED = join(FIXTURES, "documented");

describe("undocumentedExports", () => {
  it("lists every export of the entry and its subpaths without JSDoc, where it is declared", () => {
    expect(undocumentedExports(BARE)).toEqual([
      { name: "bare", file: join(BARE, "src", "parts.ts"), line: 10 },
      { name: "BareShape", file: join(BARE, "src", "parts.ts"), line: 14 },
      { name: "BARE_WORDING", file: join(BARE, "src", "wording", "de.ts"), line: 3 },
    ]);
  });

  it("passes the corrected fixture", () => {
    expect(undocumentedExports(DOCUMENTED)).toEqual([]);
  });
});

describe("generateProps", () => {
  afterEach(() => vi.restoreAllMocks());

  it("stops at an export without JSDoc and names all of them with file and line", () => {
    let written = "";
    vi.spyOn(process.stderr, "write").mockImplementation((text) => {
      written += String(text);
      return true;
    });
    vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`exit ${code}`);
    });

    expect(() => generateProps({ packageName: BARE, outline: [] })).toThrow("exit 1");
    expect(written).toContain("3 exports without JSDoc");
    expect(written).toContain("src/parts.ts:10  bare");
    expect(written).toContain("src/parts.ts:14  BareShape");
    expect(written).toContain("src/wording/de.ts:3  BARE_WORDING");
  });
});
