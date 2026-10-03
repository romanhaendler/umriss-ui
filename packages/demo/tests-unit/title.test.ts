/* The title formula (search-visibility D8) against the fixture package: the
   one function the prerendering writes `<title>` with and the shell sets
   `document.title` with, so that a title after a click equals the title after
   a reload. */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { pageTitle } from "../src/tooling/title";

const manifest = JSON.parse(readFileSync(new URL("fixtures/llms/package.json", import.meta.url), "utf8")) as {
  name: string;
  description: string;
};

describe("pageTitle", () => {
  it("titles a component page by its name, the noun and the package", () => {
    expect(pageTitle(manifest, "Gauge")).toBe("Gauge – React component · @umriss-ui/fixture");
  });

  it("titles a feature page by the same formula", () => {
    expect(pageTitle(manifest, "Installation")).toBe("Installation – React component · @umriss-ui/fixture");
  });

  it("titles the landing by the package and its description", () => {
    expect(pageTitle(manifest)).toBe("@umriss-ui/fixture – A fixture package for the llms.txt generator.");
  });

  it("takes the package's own noun where it has one", () => {
    expect(pageTitle({ name: "@umriss-ui/table", description: "" }, "Pagination")).toBe("Pagination – React table · @umriss-ui/table");
  });
});
