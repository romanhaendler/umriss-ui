/* The version-dependent rules of `check:dist` (`scripts/distRules.ts`): each rule
   passes once and fails once, for a 0.x version and for 1.0.0 and 1.1.0.

   @vitest-environment node */

import { describe, expect, it } from "vitest";
import { changelogProblems, manifestProblems, markerProblem, peerProblems } from "../../../scripts/distRules.ts";

describe("peers", () => {
  it("0.57.0 takes ^0.57.0 and refuses another minor or a 1.x form", () => {
    expect(peerProblems("0.57.1", { "@umriss-ui/core": "workspace:^0.57.0", react: "^19" })).toEqual([]);
    expect(peerProblems("0.57.0", { "@umriss-ui/core": "workspace:^0.56.0" })).toHaveLength(1);
    expect(peerProblems("0.57.0", { "@umriss-ui/core": "workspace:^1.0.0" })).toHaveLength(1);
  });
  it("1.0.0 and 1.1.0 take ^<major>.<minor>.0 and refuse the 0.x form", () => {
    expect(peerProblems("1.0.0", { "@umriss-ui/core": "workspace:^1.0.0" })).toEqual([]);
    expect(peerProblems("1.1.2", { "@umriss-ui/core": "workspace:^1.1.0" })).toEqual([]);
    expect(peerProblems("1.0.0", { "@umriss-ui/core": "workspace:^0.57.0" })).toHaveLength(1);
    expect(peerProblems("1.1.0", { "@umriss-ui/core": "workspace:^1.0.0" })).toHaveLength(1);
  });
});

describe("manifest", () => {
  const good = { engines: { node: ">=22" }, peerDependencies: { react: "^19", "react-dom": "^19" } };
  it("takes Node 22 and React ^19", () => {
    expect(manifestProblems(good)).toEqual([]);
  });
  it("refuses a manifest without engines or with react >=19", () => {
    expect(manifestProblems({ peerDependencies: good.peerDependencies })).toHaveLength(1);
    expect(manifestProblems({ ...good, peerDependencies: { react: ">=19", "react-dom": "^19" } })).toHaveLength(1);
    expect(manifestProblems({ engines: good.engines })).toHaveLength(2);
  });
});

describe("deprecation markers", () => {
  it("0.57.0 takes since 0.57 and 0.58 and refuses an older one", () => {
    expect(markerProblem("0.57.0", "/** @deprecated since 0.57 - use x. */")).toBeUndefined();
    expect(markerProblem("0.57.0", "/** @deprecated since 0.58 - use x. */")).toBeUndefined();
    expect(markerProblem("0.57.0", "/** @deprecated since 0.56 - use x. */")).toMatch(/remove it/);
    expect(markerProblem("0.57.0", "/** @deprecated use x. */")).toMatch(/names no/);
  });
  it("1.0.0 and 1.1.0 keep a marker of their major and refuse since 0.N", () => {
    expect(markerProblem("1.0.0", "/** @deprecated since 1.0 - use x. */")).toBeUndefined();
    expect(markerProblem("1.1.0", "/** @deprecated since 1.0 - use x. */")).toBeUndefined();
    expect(markerProblem("1.1.0", "/** @deprecated since 0.57 - use x. */")).toMatch(/remove it/);
    expect(markerProblem("1.1.0", "/** @deprecated since 1.3 - use x. */")).toMatch(/later minor/);
    expect(markerProblem("1.1.0", "/** @deprecated use x. */")).toMatch(/names no/);
  });
  it("a line without a marker is no problem", () => {
    expect(markerProblem("1.0.0", "export const a = 1;")).toBeUndefined();
  });
});

const section = (heading: string, body: string) => `# Changelog\n\n## ${heading} – 2026-12-01\n\n${body}\n\n## 0.1.0 – 2026-01-01\n\n### Added\n\n- old\n`;
const withMigration = "### Changed\n\n- **A**: renamed\n  - Migration: use B\n";
const withoutMigration = "### Changed\n\n- **A**: renamed\n";
const added = "### Added\n\n- **A**: new\n";

describe("changelog", () => {
  it("0.57.0 wants its heading and a Migration under every Changed entry", () => {
    expect(changelogProblems("0.57.0", section("0.57.0", withMigration))).toEqual([]);
    expect(changelogProblems("0.57.0", section("0.57.0", withoutMigration))).toHaveLength(1);
    expect(changelogProblems("0.57.0", section("0.56.0", added))).toHaveLength(1);
  });
  it("1.0.0 keeps a Changed with Migration lines", () => {
    expect(changelogProblems("1.0.0", section("1.0.0", withMigration))).toEqual([]);
    expect(changelogProblems("1.0.0", section("1.0.0", withoutMigration))).toHaveLength(1);
  });
  it("1.1.0 and 1.1.1 take Added and refuse any Changed", () => {
    expect(changelogProblems("1.1.0", section("1.1.0", added))).toEqual([]);
    expect(changelogProblems("1.1.0", section("1.1.0", withMigration))).toHaveLength(1);
    expect(changelogProblems("1.1.1", section("1.1.1", withMigration))).toHaveLength(1);
    expect(changelogProblems("2.0.0", section("2.0.0", withMigration))).toEqual([]);
  });
});
