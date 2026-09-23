import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { Chain, Given, Interim, Minus, Plus, Quotient } from "../src";
import { evaluate } from "../src/evaluate";
import { readCalculation } from "../src/model";
import { costing } from "./costing";

function run(children: ReactNode) {
  const model = readCalculation(children);
  const results = evaluate(model);
  const byLabel = (label: string) =>
    results.get([...model.quantities.values()].find((q) => q.label === label)!.key)!;
  return { result: results.get(model.result)!, byLabel };
}

describe("Evaluating a chain", () => {
  it("computes the costing sheet", () => {
    const { result, byLabel } = run(costing());
    expect(byLabel("Material cost").value).toBeCloseTo(2060.8, 9);
    expect(byLabel("Production cost").value).toBeCloseTo(4172.8, 9);
    expect(byLabel("Cost price").value).toBeCloseTo(4798.72, 9);
    expect(result.value).toBeCloseTo(5182.6176, 9);
    expect(result.shown).toBe(5182.62);
    expect(result.assessment?.deviation).toBeCloseTo(182.6176, 9);
    expect(result.approximate).toBe(false);
  });

  it("takes a Minus away, in operand order", () => {
    const { result } = run(
      <Chain>
        <Given label="Gross" value={1250} />
        <Minus label="Tare" value={180} />
        <Plus label="Returned" value={30} />
        <Minus label="Packaging" value={20} />
        <Interim label="Net" />
      </Chain>,
    );
    expect(result.value).toBe(1080);
  });

  it("makes every later interim absent when a line is missing, with the reason", () => {
    const { result, byLabel } = run(costing({ labour: null }));
    expect(byLabel("Material cost").value).toBeCloseTo(2060.8, 9);
    for (const label of ["Production cost", "Cost price", "Net offer price"]) {
      expect(byLabel(label), label).toMatchObject({ value: null, absence: { kind: "missing", label: "Direct labour" } });
    }
    expect(result.verdict).toBe("unknown");
  });

  it("sets the approximation mark on an interim", () => {
    const third = (key: string) => (
      <Plus key={key}>
        <Quotient label={`Third ${key}`}>
          <Given label="one" value={1} />
          <Given label="three" value={3} />
        </Quotient>
      </Plus>
    );
    const { result } = run(
      <Chain>
        <Given label="Start" value={0} />
        {["a", "b", "c"].map(third)}
        <Interim label="Whole" />
      </Chain>,
    );
    expect(result.shown).toBe(1);
    expect(result.approximate).toBe(true);
  });

  it("carries the worst verdict of an interim's own lines, not of the interims before", () => {
    const alarm = [{ value: 1, side: "upper" as const, severity: "alarm" as const }];
    const { byLabel } = run(
      <Chain>
        <Given label="a" value={5} limits={alarm} />
        <Plus label="b" value={1} />
        <Interim label="First" />
        <Plus label="c" value={1} />
        <Interim label="Second" />
      </Chain>,
    );
    expect(byLabel("First").worst).toBe("alarm");
    expect(byLabel("Second").worstSince).toBeUndefined();
    /* A chain folded away as an operand hides the whole chain, so there it counts. */
    expect(byLabel("Second").worst).toBe("alarm");
  });
});
