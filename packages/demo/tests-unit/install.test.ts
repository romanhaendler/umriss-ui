/* The install command, from the manifest: npm, the package, its umriss peers
   in the order core, charts - and React left to the prose. */

import { describe, expect, it } from "vitest";
import { installCommand } from "../src/tooling/install";

const REACT = { react: ">=18", "react-dom": ">=18" };

describe("installCommand", () => {
  it("names core alone", () => {
    expect(installCommand({ name: "@umriss-ui/core", peerDependencies: REACT })).toBe("npm install @umriss-ui/core");
  });

  it("names the table with core", () => {
    expect(installCommand({ name: "@umriss-ui/table", peerDependencies: { "@umriss-ui/core": "workspace:^", ...REACT } })).toBe(
      "npm install @umriss-ui/table @umriss-ui/core",
    );
  });

  it("names the schedule with core and charts, core first whatever the manifest's order", () => {
    expect(
      installCommand({ name: "@umriss-ui/schedule", peerDependencies: { "@umriss-ui/charts": "workspace:^", "@umriss-ui/core": "workspace:^", ...REACT } }),
    ).toBe("npm install @umriss-ui/schedule @umriss-ui/core @umriss-ui/charts");
  });

  it("names the package alone when the manifest has no peers", () => {
    expect(installCommand({ name: "@umriss-ui/fixture" })).toBe("npm install @umriss-ui/fixture");
  });
});
