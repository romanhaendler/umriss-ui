/* The conformance test of the limit model (ADR-0006).

   The model stands twice in the workspace, and that is a decision and not an
   oversight: charts may import nothing from core (R-1.2), core should not drag
   a canvas library into other people's bundles for thirty lines of comparison
   arithmetic, and a third package for thirty lines would be a build, a version
   and a release for thirty lines. What makes the duplication honest is this
   test: the explanation is executable. If the two versions drift apart, that is
   a red test and not a report from the field.

   It lives in core, because core may reach for charts and charts may not reach
   for core. It reaches for source files over a relative path - not for the
   package `@umriss-ui/charts` - and the last block here records, executably,
   that this does not become a runtime dependency. That is the hard condition
   from the specification.

   On a deviation the message names both answers. "expected true, got false" is
   useless when the question is which of the two packages is wrong.

   The model's own field names stay German on purpose - they are the shape the
   two packages agree on, and this test compares that shape structurally. A
   label here names the field it read; translating the label would make the
   failure message lie about what was compared. */

import { describe, expect, it } from "vitest";
import { assess as assessCore } from "../src/lib/limit";
import { assess as assessCharts } from "../../charts/src/limit";
import { LIMIT_CASES } from "../../charts/tests-unit/limitCases";
import type { Case } from "../../charts/tests-unit/limitCases";

/* The hard condition: the reach into charts stays inside the test tree.

   The manifest is read as text and src/ is searched with import.meta.glob -
   without @types/node, as is the custom here (see contrast.test.ts). */

import PACKAGE_RAW from "../package.json?raw";

const SOURCES = import.meta.glob("../src/**/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/** Every module specifier of a source file: static imports, re-exports and
    dynamic imports. */
function specifiers(source: string): string[] {
  const found: string[] = [];
  const pattern = /(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|\bimport\s+)["']([^"']+)["']/g;
  let match = pattern.exec(source);
  while (match !== null) {
    found.push(match[1] as string);
    match = pattern.exec(source);
  }
  return found;
}

function pointsAtCharts(specifier: string): boolean {
  return specifier.startsWith("@umriss-ui/charts") || specifier.includes("/charts/");
}

/* Structurally, not imported: the test may not declare either of the two
   versions the truth about the other. The field names are the agreed shape and
   stay as they are. */
interface AssessmentLike {
  verdict: string;
  limit?: { value: number; side: string; severity: string };
  excess?: number;
  deviation?: number;
}

function limitAsText(limit: AssessmentLike["limit"]): string {
  return limit === undefined ? "undefined" : `${limit.severity} ${limit.side} ${limit.value}`;
}

/* A missing field and a field holding undefined are not the same thing here:
   the promise is that without a target value no deviation stands there. The
   rendering makes the difference visible, so that it cannot drift unnoticed. */
function rendering(assessment: AssessmentLike): string {
  const parts = [`verdict=${assessment.verdict}`];
  parts.push(
    "limit" in assessment
      ? `limit=${limitAsText(assessment.limit)}`
      : "limit missing",
  );
  parts.push(
    "excess" in assessment
      ? `excess=${String(assessment.excess)}`
      : "excess missing",
  );
  parts.push(
    "deviation" in assessment
      ? `deviation=${String(assessment.deviation)}`
      : "deviation missing",
  );
  return parts.join(", ");
}

function compare(testCase: Case): void {
  const fromCharts = rendering(assessCharts(testCase.value, testCase.set));
  const fromCore = rendering(assessCore(testCase.value, testCase.set));
  expect(
    fromCore,
    `Case "${testCase.name}": charts says [${fromCharts}], core says [${fromCore}]`,
  ).toBe(fromCharts);
}

for (const group of new Set(LIMIT_CASES.map((testCase) => testCase.group))) {
  describe(`Conformance - ${group}`, () => {
    for (const testCase of LIMIT_CASES.filter((c) => c.group === group)) {
      it(testCase.name, () => compare(testCase));
    }
  });
}

describe("Conformance - the case table itself", () => {
  it("runs every case, and has some", () => {
    // A loop that ran empty would be a green test checking nothing.
    expect(LIMIT_CASES.length).toBeGreaterThan(20);
  });

  it("has no two cases of the same name", () => {
    // Two cases named alike are two indistinguishable messages.
    const names = LIMIT_CASES.map((testCase) => testCase.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("Conformance - no runtime dependency from core on charts", () => {
  const manifest = JSON.parse(PACKAGE_RAW) as {
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  it("lists @umriss-ui/charts neither as a dependency nor as a peer", () => {
    expect(Object.keys(manifest.dependencies ?? {})).not.toContain("@umriss-ui/charts");
    expect(Object.keys(manifest.peerDependencies ?? {})).not.toContain("@umriss-ui/charts");
  });

  it("reaches for charts from no module under src/", () => {
    // Module specifiers, not full text: that a comment mentions charts is
    // allowed and even wanted - the duplication should be explained where it
    // stands. What is forbidden is the import.
    const hits = Object.entries(SOURCES)
      .filter(([, source]) => specifiers(source).some(pointsAtCharts))
      .map(([path]) => path);
    expect(hits, `These modules under src/ import charts: ${hits.join(", ")}`).toEqual([]);
  });

  it("looks at source files at all", () => {
    // Otherwise the test above would be green because it reads nothing.
    expect(Object.keys(SOURCES).length).toBeGreaterThan(20);
  });
});
