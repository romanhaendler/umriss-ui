/* The changelog draft's subject parser (scripts/changelog.ts): importing it
   runs no git command. */
import { describe, expect, it } from "vitest";
import { parseSubject } from "../../../scripts/changelog.ts";

describe("parseSubject", () => {
  it("sends a lowercase prefix to its package", () => {
    expect(parseSubject("core: the thing is true")).toEqual({ text: "The thing is true", names: ["core"] });
  });

  it("splits capitalised names on commas and and", () => {
    expect(parseSubject("Table and alarms: x")?.names).toEqual(["table", "alarms"]);
    expect(parseSubject("core, charts: x")?.names).toEqual(["core", "charts"]);
  });

  it("keeps a subject that names no package, whatever the prefix", () => {
    expect(parseSubject("Field contract: the deprecated onChange(value) is removed")?.names).toEqual(["field contract"]);
    expect(parseSubject("CI: a manual check")?.names).toEqual(["ci"]);
  });

  it("skips Release and Merge subjects", () => {
    expect(parseSubject("Release: core 0.53.0")).toBeNull();
    expect(parseSubject("Merge: Tabs name their callback")).toBeNull();
    expect(parseSubject("Merge branch 'x'")).toBeNull();
  });
});
