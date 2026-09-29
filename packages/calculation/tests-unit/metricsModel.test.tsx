import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { Chain, DividedBy, Given, Interim, Minus, Plus, Product, Quotient, Sum, Times } from "../src";
import type { Metric } from "../src";
import { readCalculation } from "../src/model";
import { STAFF, staff } from "./staff";

const read = (children: ReactNode, metrics: readonly Metric[] = STAFF) => () =>
  readCalculation(children, metrics);

const two = (a: ReactNode) => (
  <Sum label="Area">
    {a}
    <Given label="Team B" value={{ heads: 4, fte: 3.5 }} />
  </Sum>
);

describe("Reading metrics", () => {
  it("reads the lead case, and keeps the metrics on the model", () => {
    const model = readCalculation(staff(), STAFF);
    expect(model.metrics).toBe(STAFF);
    expect(model.quantities.size).toBe(10);
  });

  it("reads a number per metric on a chain's line", () => {
    expect(
      read(
        <Chain>
          <Given label="Staff on 30 June" value={{ heads: 154, fte: 131.2 }} />
          <Minus label="Leavers" value={{ heads: 3, fte: 2 }} />
          <Interim label="Staff on 30 September" />
        </Chain>,
      ),
    ).not.toThrow();
  });
});

describe("Development errors with metrics", () => {
  it("metrics empty, or an id used twice", () => {
    expect(read(staff(), [])).toThrow("<Calculation>: metrics is empty; leave it out for a calculation with one number per quantity.");
    expect(read(staff(), [STAFF[0]!, { id: "heads", label: "Heads again" }])).toThrow(
      '<Calculation>: the metric id "heads" is used twice.',
    );
  });

  it("a value that is not an object by metric", () => {
    expect(read(two(<Given label="Team A" value={3} />))).toThrow(
      '<Calculation> › Area › Team A: with metrics, value is an object with a number for each metric - "heads", "fte".',
    );
  });

  it("a metric's number left out, or one for no metric", () => {
    expect(read(two(<Given label="Team A" value={{ heads: 3 }} />))).toThrow(
      '<Calculation> › Area › Team A: value has no number for the metric "fte"; write null where it is absent. The metrics: "heads", "fte".',
    );
    expect(read(two(<Given label="Team A" value={{ heads: 3, fte: 2.5, ftee: 2.5 }} />))).toThrow(
      '<Calculation> › Area › Team A: value has a number for "ftee", which is no metric. The metrics: "heads", "fte".',
    );
  });

  it("a value by metric where the calculation has none", () => {
    expect(() => readCalculation(two(<Given label="Team A" value={{ heads: 3, fte: 2.5 }} />))).toThrow(
      "<Calculation> › Area › Team A: value is an object by metric, but the calculation has no metrics.",
    );
  });

  it("unit, format or places on a quantity: they are the metric's", () => {
    expect(read(two(<Given label="Team A" value={{ heads: 3, fte: 2.5 }} unit="HC" />))).toThrow(
      "<Calculation> › Area › Team A: unit belongs to the metric once the calculation has metrics, not to a quantity.",
    );
    expect(
      read(
        <Sum label="Area" decimals={1}>
          <Given label="Team A" value={{ heads: 3, fte: 2.5 }} />
          <Given label="Team B" value={{ heads: 4, fte: 3.5 }} />
        </Sum>,
      ),
    ).toThrow("<Calculation> › Area: decimals belongs to the metric");
    expect(
      read(
        <Chain>
          <Given label="Staff on 30 June" value={{ heads: 154, fte: 131.2 }} />
          <Minus label="Leavers" value={{ heads: 3, fte: 2 }} />
          <Interim label="Staff on 30 September" format="percent" />
        </Chain>,
      ),
    ).toThrow("<Calculation> › <Chain> › Staff on 30 September: format belongs to the metric");
  });

  it("a target or limits: not assessed with metrics", () => {
    expect(read(two(<Given label="Team A" value={{ heads: 3, fte: 2.5 }} target={3} />))).toThrow(
      "<Calculation> › Area › Team A: target and limits are not assessed in a calculation with metrics.",
    );
    expect(read(two(<Given label="Team A" value={{ heads: 3, fte: 2.5 }} limits={[]} />))).toThrow(
      "target and limits are not assessed",
    );
  });

  it("a product or quotient: a calculation with metrics only adds and subtracts", () => {
    const only = "a calculation with metrics only adds and subtracts - <Sum>, <Difference>, <Plus>, <Minus>.";
    for (const Operator of [Product, Quotient]) {
      expect(
        read(
          <Operator label="Area">
            <Given label="Team A" value={{ heads: 3, fte: 2.5 }} />
            <Given label="Team B" value={{ heads: 4, fte: 3.5 }} />
          </Operator>,
        ),
      ).toThrow(`<Calculation> › Area: <${Operator === Product ? "Product" : "Quotient"}> - ${only}`);
    }
    for (const [Line, name] of [
      [Times, "Times"],
      [DividedBy, "DividedBy"],
    ] as const) {
      expect(
        read(
          <Chain>
            <Given label="Staff" value={{ heads: 154, fte: 131.2 }} />
            <Line label="Growth" value={{ heads: 1.05, fte: 1.05 }} />
            <Interim label="Planned staff" />
          </Chain>,
        ),
      ).toThrow(`<Calculation> › <Chain>: <${name}> - ${only}`);
    }
    /* A line holding a sum is still a sum. */
    expect(
      read(
        <Chain>
          <Given label="Staff" value={{ heads: 154, fte: 131.2 }} />
          <Plus>{two(<Given label="Team A" value={{ heads: 3, fte: 2.5 }} />)}</Plus>
          <Interim label="Planned staff" />
        </Chain>,
      ),
    ).not.toThrow();
  });
});
