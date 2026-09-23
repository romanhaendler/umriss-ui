import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { Difference, Given, Product, Quotient, Ref, Sum } from "../src";
import { readCalculation } from "../src/model";
import { oee } from "./oee";

const labels = (children: ReactNode) => {
  const model = readCalculation(children);
  const q = (key: string) => model.quantities.get(key)!;
  return { model, q };
};

describe("Reading the declaration", () => {
  it("reads the OEE case: operators, operands in order, references resolved", () => {
    const { model, q } = labels(oee());
    expect(model.result).toBe("0");
    expect(q("0")).toMatchObject({ label: "OEE", operator: "product", format: "percent", target: 0.85 });
    expect(q("0").operands.map((o) => q(o.key).label)).toEqual(["Availability", "Performance", "Quality"]);
    const [availability, performance, quality] = q("0").operands.map((o) => q(o.key));
    const [runTime, planned] = availability!.operands;
    expect(runTime!.reference).toBe(false);
    expect(planned!.reference).toBe(true);
    expect(q(planned!.key)).toMatchObject({ id: "planned", given: { value: 450 }, unit: "min" });
    expect(performance!.operands[1]).toEqual({ key: runTime!.key, reference: true });
    expect(quality!.operands.map((o) => q(o.key).label)).toEqual(["Good count", "Total count"]);
    expect(model.quantities.size).toBe(11);
  });

  it("reads through .map and fragments inside an operator", () => {
    const items = [
      { label: "Material", value: 4.2 },
      { label: "Energy", value: 0.9 },
    ];
    const { model, q } = labels(
      <Sum label="Cost per piece" unit="€">
        {items.map((item) => (
          <Given key={item.label} label={item.label} value={item.value} unit="€" />
        ))}
        <>
          <Given label="Labour" value={1.3} unit="€" />
        </>
        {false}
      </Sum>,
    );
    expect(q(model.result).operands.map((o) => q(o.key).label)).toEqual(["Material", "Energy", "Labour"]);
  });
});

describe("Development errors", () => {
  const read = (children: ReactNode) => () => readCalculation(children);

  it("not exactly one child", () => {
    expect(read(null)).toThrow("<Calculation> takes exactly one child, the result; it was given 0.");
    expect(read([<Given key="a" label="A" value={1} />, <Given key="b" label="B" value={2} />])).toThrow(
      "it was given 2",
    );
  });

  it("a wrong operand count", () => {
    expect(read(<Sum label="S"><Given label="A" value={1} /></Sum>)).toThrow(
      "<Calculation> › S: <Sum> takes two or more operands; it was given 1.",
    );
    expect(
      read(
        <Quotient label="Q">
          <Given label="A" value={1} />
          <Given label="B" value={1} />
          <Given label="C" value={1} />
        </Quotient>,
      ),
    ).toThrow("<Quotient> takes exactly two operands; it was given 3.");
  });

  it("a duplicate id", () => {
    expect(
      read(
        <Sum label="S">
          <Given id="a" label="A" value={1} />
          <Given id="a" label="B" value={1} />
        </Sum>,
      ),
    ).toThrow('<Calculation> › S › B: the id "a" is used twice.');
  });

  it("a reference naming no quantity lists the ids that exist", () => {
    expect(read(sumWith(<Ref to="plannd" />))).toThrow(
      '<Ref to="plannd"> names no quantity. The ids that exist: "a", "b".',
    );
  });

  it("a cycle through references", () => {
    expect(
      read(
        <Sum label="S">
          <Difference id="d" label="D">
            <Given label="A" value={1} />
            <Ref to="p" />
          </Difference>
          <Product id="p" label="P">
            <Given label="B" value={1} />
            <Ref to="d" />
          </Product>
        </Sum>,
      ),
    ).toThrow("goes round in a circle through references: D → P → D.");
  });

  it("an element the calculation cannot read", () => {
    const Wrapper = () => <Given label="A" value={1} />;
    expect(
      read(
        <Sum label="S">
          <Wrapper />
          <Given label="B" value={1} />
        </Sum>,
      ),
    ).toThrow("<Calculation> › S: <Wrapper> is not an element of the calculation.");
    expect(read(<Ref to="x" />)).toThrow("<Calculation>: <Ref> cannot stand here");
  });
});

function sumWith(extra: ReactNode) {
  return (
    <Sum label="S">
      <Given id="a" label="A" value={1} />
      <Given id="b" label="B" value={1} />
      {extra}
    </Sum>
  );
}
