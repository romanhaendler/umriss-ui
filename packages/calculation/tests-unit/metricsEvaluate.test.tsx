import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { evaluate } from "../src/evaluate";
import { perMetric, readCalculation } from "../src/model";
import { Chain, Given, Interim, Minus, Plus, Sum } from "../src";
import { STAFF, staff } from "./staff";

/** Every metric evaluated; `of(metric, label)` finds one quantity's result. */
function run(children: ReactNode, metrics = STAFF) {
  const views = perMetric(readCalculation(children, metrics));
  const results = views.map((view) => evaluate(view));
  const of = (metric: string, label: string) => {
    const index = metrics.findIndex((m) => m.id === metric);
    const key = [...views[index]!.quantities.values()].find((q) => q.label === label)!.key;
    return results[index]!.get(key)!;
  };
  return { of };
}

describe("Evaluating metrics", () => {
  it("works the same derivation once per metric", () => {
    const { of } = run(staff({ students: 3.2 }));
    expect(of("heads", "Production").value).toBe(96);
    expect(of("fte", "Production").value).toBeCloseTo(84.5, 9);
    expect(of("heads", "Industry").value).toBe(160);
    expect(of("fte", "Industry").value).toBeCloseTo(133.4, 9);
    expect(of("fte", "Industry").shown).toBe(133.4);
  });

  it("keeps an absent number in its metric: the other metric sums on", () => {
    const { of } = run(staff());
    expect(of("heads", "Logistics").value).toBe(64);
    expect(of("heads", "Industry").value).toBe(160);
    for (const label of ["Logistics", "Industry"]) {
      expect(of("fte", label), label).toMatchObject({ value: null, absence: { kind: "missing", label: "Student staff" } });
    }
    expect(of("fte", "Production").value).toBeCloseTo(84.5, 9);
  });

  it("works a chain per metric, a Minus taken away in each", () => {
    const { of } = run(
      <Chain>
        <Given label="Staff on 30 June" value={{ heads: 154, fte: 131.2 }} />
        <Plus label="Joiners" value={{ heads: 9, fte: 7.5 }} />
        <Minus label="Leavers" value={{ heads: 3, fte: 2.0 }} />
        <Minus label="Parental leave" value={{ heads: 2, fte: 1.6 }} />
        <Interim label="Staff on 30 September" />
      </Chain>,
    );
    expect(of("heads", "Staff on 30 September").value).toBe(158);
    expect(of("fte", "Staff on 30 September").value).toBeCloseTo(135.1, 9);
  });

  it("sets the approximation mark in the metric whose shown numbers do not add up", () => {
    const { of } = run(
      <Sum label="Area">
        <Given label="Team A" value={{ heads: 3, fte: 1.04 }} />
        <Given label="Team B" value={{ heads: 4, fte: 1.04 }} />
      </Sum>,
    );
    /* FTE shown with one place: 1.0 + 1.0 on the screen, 2.1 as the sum. */
    expect(of("fte", "Area")).toMatchObject({ shown: 2.1, approximate: true });
    expect(of("heads", "Area")).toMatchObject({ shown: 7, approximate: false });
  });
});
