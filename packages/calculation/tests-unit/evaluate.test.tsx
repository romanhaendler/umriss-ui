import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { Difference, Given, Product, Quotient, Sum } from "../src";
import { evaluate } from "../src/evaluate";
import { readCalculation } from "../src/model";
import { oee } from "./oee";

function run(children: ReactNode) {
  const model = readCalculation(children);
  const results = evaluate(model);
  const byLabel = (label: string) =>
    results.get([...model.quantities.values()].find((q) => q.label === label)!.key)!;
  return { result: results.get(model.result)!, byLabel };
}

const three = (A: typeof Sum) => (
  <A label="R">
    <Given label="a" value={20} />
    <Given label="b" value={5} />
    <Given label="c" value={3} />
  </A>
);

describe("Evaluation", () => {
  it("computes each operator, in operand order", () => {
    expect(run(three(Sum)).result.value).toBe(28);
    expect(run(three(Difference)).result.value).toBe(12);
    expect(run(three(Product)).result.value).toBe(300);
    expect(
      run(
        <Quotient label="R">
          <Given label="a" value={20} />
          <Given label="b" value={5} />
        </Quotient>,
      ).result.value,
    ).toBe(4);
  });

  it("computes the OEE numbers in full precision and shows them rounded", () => {
    const { result, byLabel } = run(oee());
    expect(byLabel("Run time").value).toBe(412);
    expect(byLabel("Availability").value).toBeCloseTo(412 / 450, 12);
    expect(byLabel("Availability").shown).toBe(91.6);
    expect(byLabel("Performance").value).toBeCloseTo(384 / 412, 12);
    expect(byLabel("Quality").value).toBeCloseTo(461 / 480, 12);
    expect(result.value).toBeCloseTo((384 / 450) * (461 / 480), 12);
    expect(result.shown).toBe(82);
    expect(result.approximate).toBe(false);
  });

  it("makes every dependent quantity absent, naming the given at the root", () => {
    const { result, byLabel } = run(oee({ downtime: null }));
    const missing = { kind: "missing", label: "Downtime" };
    for (const label of ["Downtime", "Run time", "Availability", "Performance", "OEE"]) {
      expect(byLabel(label), label).toMatchObject({ value: null, shown: null, absence: missing, verdict: "unknown" });
    }
    expect(byLabel("Quality").value).not.toBeNull();
    expect(result.assessment?.verdict).toBe("unknown");
  });

  it("makes a quotient by zero absent with its own reason", () => {
    const { result } = run(
      <Sum label="R">
        <Given label="a" value={1} />
        <Quotient label="q">
          <Given label="n" value={3} />
          <Given label="Hours run" value={0} />
        </Quotient>
      </Sum>,
    );
    expect(result).toMatchObject({ value: null, absence: { kind: "zero", label: "Hours run" } });
  });

  it("sets the approximation mark only where the shown operands miss the shown result", () => {
    const third = (key: string) => (
      <Quotient key={key} label={`t${key}`}>
        <Given label="one" value={1} />
        <Given label="three" value={3} />
      </Quotient>
    );
    const sum = run(<Sum label="R">{["1", "2", "3"].map(third)}</Sum>);
    expect(sum.result.shown).toBe(1);
    expect(sum.result.approximate).toBe(true);
    expect(sum.byLabel("t1").approximate).toBe(false);
  });

  it("assesses against target and limits, and carries the worst verdict up", () => {
    const { result, byLabel } = run(
      <Sum label="R" target={10}>
        <Product label="P" limits={[{ value: 5, side: "upper", severity: "alarm" }]}>
          <Given label="a" value={2} limits={[{ value: 1, side: "upper", severity: "warning" }]} />
          <Given label="b" value={3} />
        </Product>
        <Given label="c" value={1} />
      </Sum>,
    );
    expect(byLabel("a").verdict).toBe("warning");
    expect(byLabel("P")).toMatchObject({ verdict: "alarm", worst: "warning" });
    expect(result).toMatchObject({ verdict: undefined, worst: "alarm" });
    expect(result.assessment).toEqual({ verdict: "ok", deviation: -3 });
  });
});
