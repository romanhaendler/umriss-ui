/* The full text as the npm package carries it: links that lead nowhere in a
   file read without the site keep only their text. */

import { describe, expect, it } from "vitest";
import { packagedText } from "../src/tooling/llms";
import { ADR_0032 } from "../src/outline";

const PLACE = "https://example.test/umriss-ui/core/";
const run = {
  manifest: { name: "@umriss-ui/core", version: "1.2.3", description: "", place: PLACE },
  pages: [{ id: "chart", name: "Chart" }],
  scenarios: [{ id: "watch", title: "Watch" }],
} as unknown as Parameters<typeof packagedText>[0];

const FULL = [
  "# core",
  "",
  "## Chart",
  "",
  "### Chart",
  "",
  "Demo page: " + PLACE + "chart/",
  "",
  "#### Chart",
  "",
  "```ts",
  "# Chart",
  "```",
  "",
  "## Scenarios",
  "",
  "### Watch",
  "",
  `[page](${PLACE}chart/) [hash](#/chart) [scene](#/scenarios/watch) [gone](#/nothing) [type](#type-Density)`,
  `[ok](#chart-1) [adr](${ADR_0032}) [other](${PLACE.replace("core/", "")}elsewhere/) [out](https://example.org/x)`,
  "",
].join("\n");

describe("packagedText", () => {
  const text = packagedText(run, FULL);

  it("points a page link at the page's own heading when an earlier heading has the same name", () => {
    expect(text).toContain("[page](#chart-1)");
    expect(text).toContain("[hash](#chart-1)");
    expect(text).toContain("[scene](#watch)");
  });

  it("keeps only the text of a link whose target is no heading", () => {
    expect(text).toContain(" gone ");
    expect(text).toContain(" type\n");
    expect(text).toContain("[ok](#chart-1)");
    expect(text).not.toContain("](#type-Density)");
  });

  it("links the ADR to the version's tag, drops the site's other links, and keeps the foreign ones", () => {
    expect(text).toMatch(/\[adr\]\(https:\/\/github\.com\/[^/]+\/umriss-ui\/blob\/core-v1\.2\.3\/docs\/adr\/0032-[^)]+\.md\)/);
    expect(text).toContain(" other ");
    expect(text).toContain("[out](https://example.org/x)");
    expect(text).not.toContain("Demo page:");
  });
});
