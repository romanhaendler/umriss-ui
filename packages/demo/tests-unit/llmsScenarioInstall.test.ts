/* A scenario that is built from another package's page says how to install that package beside
   its own - the llms-full text is what an agent installs from. The fixture's scenario is built
   from `@umriss-ui/charts#trend`. */

import { describe, expect, it, vi } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { renderLlms } from "../src/tooling/llms";
import type { Rubric } from "../src/outline";

vi.mock("../src/packages", async (importOriginal) => {
  const { PACKAGES } = await importOriginal<typeof import("../src/packages")>();
  return {
    PACKAGES: [
      ...PACKAGES,
      { id: "fixture", name: "Fixture", npm: "@umriss-ui/fixture", role: "A fixture", start: "meter" },
    ],
  };
});

const PACKAGE_DIR = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "llms");

const OUTLINE: readonly Rubric[] = [
  {
    id: "instruments",
    name: "Instruments",
    sentence: "What a value is read on.",
    pages: [{ id: "gauge", name: "Gauge", sentence: "One value as a needle.", types: [], exports: ["Gauge"] }],
  },
];

const { full } = renderLlms({ packageDir: PACKAGE_DIR, outline: OUTLINE, tables: {} });

describe("llms.txt scenarios with another package", () => {
  it("names the install command of the packages the scenario is built from, beside its own", () => {
    expect(full).toContain("Built from: Gauge, Trend.\n\nInstall the packages it is built from with:\n\n```sh\nnpm install @umriss-ui/fixture @umriss-ui/charts\n```");
  });
});
