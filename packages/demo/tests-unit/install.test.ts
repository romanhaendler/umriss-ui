/* The install command, from the manifest: npm, the package, its umriss peers
   in the order core, charts - and React left to the prose. And the front
   page's line of what a package needs, from the same peers. */

import { describe, expect, it } from "vitest";
import { dependencyLine, installCommand } from "../src/tooling/install";

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

describe("dependencyLine (.scratch/site-front-page)", () => {
  it("says a package with no umriss peers stands alone", () => {
    expect(dependencyLine({ name: "@umriss-ui/charts", peerDependencies: REACT })).toBe("stands alone");
    expect(dependencyLine({ name: "@umriss-ui/fixture" })).toBe("stands alone");
  });

  it("says a package with core as its peer needs core", () => {
    expect(dependencyLine({ name: "@umriss-ui/table", peerDependencies: { "@umriss-ui/core": "workspace:^", ...REACT } })).toBe("needs core");
  });

  it("says a package with core and charts needs both, core first whatever the manifest's order", () => {
    expect(
      dependencyLine({ name: "@umriss-ui/schedule", peerDependencies: { "@umriss-ui/charts": "workspace:^", "@umriss-ui/core": "workspace:^", ...REACT } }),
    ).toBe("needs core and charts");
  });
});
