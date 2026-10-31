/* llms.txt ends with the `## Optional` section llmstxt.org names: what a reader short of room may skip. */

import { expect, it } from "vitest";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderLlms } from "../src/tooling/llms";

it("closes with an Optional section that links the full text", () => {
  const { index } = renderLlms({
    packageDir: join(dirname(fileURLToPath(import.meta.url)), "fixtures", "llms"),
    outline: [{ id: "i", name: "Instruments", sentence: "Read.", pages: [{ id: "gauge", name: "Gauge", sentence: "A needle.", types: [], exports: [] }] }],
    tables: {},
  });
  expect(index.slice(index.indexOf("\n## Optional\n"))).toContain("(http://localhost:4170/umriss-ui/fixture/llms-full.txt)");
  expect(index.indexOf("## Optional")).toBeGreaterThan(index.indexOf("## Instruments"));
});
