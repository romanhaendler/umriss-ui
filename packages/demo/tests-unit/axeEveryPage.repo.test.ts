/* Axe sees every page of every demo: each accessibility spec iterates the demo's
   derived list of pages, and no written sample of pages is left in it. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { PACKAGES } from "../../../scripts/ports";

const PACKAGES_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (pkg: string, file: string) => readFileSync(join(PACKAGES_DIR, pkg, "tests-visual", file), "utf8");

describe.each(PACKAGES)("%s demo", (pkg) => {
  it("takes the pages of its axe spec from the derived list, not a written sample", () => {
    const spec = read(pkg, "accessibility.spec.ts");
    expect(spec).toMatch(/for \(const pageId of PAGES\)/);
    expect(spec).not.toMatch(/SAMPLE/);
  });
});
