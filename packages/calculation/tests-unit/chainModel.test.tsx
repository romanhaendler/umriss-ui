import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { Chain, DividedBy, Given, Interim, Minus, Plus, Product, Ref, Sum, Times } from "../src";
import { readCalculation } from "../src/model";
import { costing } from "./costing";

function read(children: ReactNode) {
  const model = readCalculation(children);
  const byLabel = (label: string) => [...model.quantities.values()].find((q) => q.label === label)!;
  const labels = (label: string) => byLabel(label).operands.map((o) => model.quantities.get(o.key)!.label);
  return { model, byLabel, labels };
}

describe("Reading a chain", () => {
  it("reads the costing sheet into interims: the interim before, the operands since", () => {
    const { model, byLabel, labels } = read(costing());
    const result = model.quantities.get(model.result)!;
    expect(result).toMatchObject({ label: "Net offer price", interim: true, operator: "product", target: 5000 });
    expect(labels("Net offer price")).toEqual(["Cost price", "Profit mark-up"]);
    expect(byLabel("Net offer price").operands[0]).toMatchObject({ previous: true, reference: false });
    expect(labels("Material cost")).toEqual(["Direct material", "Material overhead"]);
    expect(byLabel("Material cost").operands.some((o) => o.previous)).toBe(false);
    expect(labels("Production cost")).toEqual(["Material cost", "Direct labour", "Production overhead"]);
    expect(byLabel("Production cost").operator).toBe("sum");
    expect(labels("Production overhead")).toEqual(["Production overhead rate", "Direct labour"]);
    expect(byLabel("Production overhead").operands[1]!.reference).toBe(true);
    expect(byLabel("Direct labour")).toMatchObject({ id: "labour", given: { value: 960 }, unit: "€" });
  });

  it("marks a Minus as taken away, a reference included", () => {
    const { byLabel } = read(
      <Chain>
        <Given id="gross" label="Gross weight" value={1250} unit="kg" />
        <Minus label="Tare" value={180} unit="kg" />
        <Minus>
          <Ref to="gross" />
        </Minus>
        <Interim label="Net weight" unit="kg" />
      </Chain>,
    );
    const operands = byLabel("Net weight").operands;
    expect(operands.map((o) => o.negated ?? false)).toEqual([false, true, true]);
    expect(operands[2]).toMatchObject({ reference: true, key: byLabel("Gross weight").key });
  });

  it("reads lines built with .map, a chain in a tree and a tree in a chain", () => {
    const items = ["Steel", "Paint", "Screws"].map((name, i) => <Plus key={name} label={name} value={i + 1} />);
    const { byLabel, labels } = read(
      <Product label="Order">
        <Chain>
          <Given label="Base" value={1} />
          {items}
          <Interim label="Per piece" />
        </Chain>
        <Sum label="Pieces">
          <Given label="Good" value={10} />
          <Given label="Rework" value={2} />
        </Sum>
      </Product>,
    );
    expect(labels("Order")).toEqual(["Per piece", "Pieces"]);
    expect(labels("Per piece")).toEqual(["Base", "Steel", "Paint", "Screws"]);
    expect(byLabel("Steel").key).toContain("$Steel");
  });
});

describe("Development errors of a chain", () => {
  const fails = (children: ReactNode) => () => readCalculation(children);

  it("a first line with an operator", () => {
    expect(fails(<Chain><Plus label="a" value={1} /><Interim label="i" /></Chain>)).toThrow(
      "<Calculation> › <Chain>: a chain starts with a quantity that has no operator",
    );
  });

  it("a chain not ending with an interim", () => {
    expect(fails(<Chain><Given label="a" value={1} /><Plus label="b" value={1} /></Chain>)).toThrow(
      "a chain ends with an <Interim>, which names its value.",
    );
    expect(fails(<Chain><Given label="a" value={1} /></Chain>)).toThrow("a chain ends with an <Interim>");
  });

  it("two interims in a row", () => {
    expect(
      fails(
        <Chain>
          <Given label="a" value={1} />
          <Plus label="b" value={1} />
          <Interim label="i" />
          <Interim label="j" />
        </Chain>,
      ),
    ).toThrow('<Chain> › j: an <Interim> needs an operand since the named value before it, <Interim label="i">.');
  });

  it("a times or divided by not alone between two named values", () => {
    const alone = "stands alone between two named values - directly after the first quantity or an <Interim>, and directly before an <Interim>.";
    expect(
      fails(
        <Chain>
          <Given label="a" value={1} />
          <Plus label="b" value={1} />
          <Times label="c" value={2} />
          <Interim label="i" />
        </Chain>,
      ),
    ).toThrow(`<Times> ${alone}`);
    expect(
      fails(
        <Chain>
          <Given label="a" value={1} />
          <DividedBy label="c" value={2} />
          <Plus label="b" value={1} />
          <Interim label="i" />
        </Chain>,
      ),
    ).toThrow(`<DividedBy> ${alone}`);
  });

  it("a line without an operator, and a line tag with both forms", () => {
    expect(fails(<Chain><Given label="a" value={1} /><Given label="b" value={1} /><Interim label="i" /></Chain>)).toThrow(
      "<Given> needs an operator in a chain",
    );
    expect(
      fails(
        <Chain>
          <Given label="a" value={1} />
          <Plus label="b" value={1}>
            <Given label="c" value={1} />
          </Plus>
          <Interim label="i" />
        </Chain>,
      ),
    ).toThrow("<Plus> takes either a label and a value, or exactly one quantity as its child.");
    expect(
      fails(
        <Chain>
          <Given label="a" value={1} />
          <Plus unit="€">
            <Given label="c" value={1} />
          </Plus>
          <Interim label="i" />
        </Chain>,
      ),
    ).toThrow("<Plus> takes either a label and a value, or exactly one quantity as its child.");
  });

  it("an interim or a line outside a chain", () => {
    expect(fails(<Interim label="i" />)).toThrow("<Calculation>: <Interim> cannot stand here");
    expect(fails(<Sum label="s"><Plus label="a" value={1} /><Given label="b" value={1} /></Sum>)).toThrow(
      "<Calculation> › s: <Plus> cannot stand here",
    );
  });
});
