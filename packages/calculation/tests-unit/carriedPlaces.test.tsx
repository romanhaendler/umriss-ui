import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Calculation, Chain, Given, Interim, Plus, Product, Ref, Sum, Times } from "../src";
import { evaluate } from "../src/evaluate";
import { readCalculation } from "../src/model";

const decimalsOf = (children: Parameters<typeof readCalculation>[0]) => {
  const model = readCalculation(children);
  return (label: string) => [...model.quantities.values()].find((q) => q.label === label)!.decimals;
};

describe("Places that carry down", () => {
  it("goes to an operand of the same unit and format, down the tree, and not to another unit", () => {
    const at = decimalsOf(
      <Sum label="Total" unit="€" decimals={2}>
        <Product label="Labour" unit="€">
          <Given label="Hours" value={1.5} unit="h" />
          <Given label="Rate" value={30.2} unit="€/h" />
          <Product label="Inner" unit="€">
            <Given label="a" value={1} unit="€" />
            <Given label="b" value={2} unit="€" />
          </Product>
        </Product>
        <Given label="Fee" value={5} unit="€" />
      </Sum>,
    );
    expect(at("Labour")).toBe(2);
    expect(at("Inner")).toBe(2);
    expect(at("a")).toBe(2);
    expect(at("Fee")).toBe(2);
    expect(at("Hours")).toBeUndefined();
    expect(at("Rate")).toBeUndefined();
  });

  it("keeps an operand's own places and does not cross to another format", () => {
    const at = decimalsOf(
      <Sum label="Total" unit="%" decimals={2}>
        <Given label="Own" value={1} unit="%" decimals={0} />
        <Given label="Share" value={0.5} unit="%" format="percent" />
      </Sum>,
    );
    expect(at("Own")).toBe(0);
    expect(at("Share")).toBeUndefined();
  });

  it("gives a reference the places where its quantity is defined", () => {
    const at = decimalsOf(
      <Sum label="Total" decimals={3}>
        <Sum label="Left">
          <Given label="Base" id="base" value={1} />
        </Sum>
        <Sum label="Right" decimals={1}>
          <Ref to="base" />
        </Sum>
      </Sum>,
    );
    expect(at("Base")).toBe(3);
  });

  it("carries through a chain's interims", () => {
    const at = decimalsOf(
      <Chain>
        <Given label="Start" value={1} unit="€" />
        <Plus label="Add" value={2} unit="€" />
        <Interim label="Net" unit="€" decimals={2} />
        <Times label="Rate" value={1.19} unit="€" />
        <Interim label="Gross" unit="€" decimals={1} />
      </Chain>,
    );
    expect(at("Net")).toBe(2);
    expect(at("Start")).toBe(2);
    expect(at("Gross")).toBe(1);
    expect(at("Rate")).toBe(1);
  });
});

describe("A non-zero total never reads 0", () => {
  const total = (decimals?: number) => {
    const model = readCalculation(
      <Sum label="Total" unit="mg" decimals={decimals}>
        <Given label="a" value={1e-9} unit="mg" />
        <Given label="b" value={2e-9} unit="mg" />
      </Sum>,
    );
    return evaluate(model).get(model.result)!;
  };

  it("shows the tiny derived total without fixed places, and without a mark", () => {
    const { shown, approximate } = total();
    expect(shown).toBeCloseTo(3e-9, 15);
    expect(shown).not.toBe(0);
    expect(approximate).toBe(false);
  });

  it("keeps a caller's places as given", () => {
    expect(total(2).shown).toBe(0);
    expect(total(2).approximate).toBe(false);
  });
});

describe("The composed-app case", () => {
  it("reads every euro line with two places and the hours as given", () => {
    const { container } = render(
      <Calculation>
        <Sum label="Total" unit="€" decimals={2}>
          <Product label="Labour" unit="€">
            <Given label="Hours" value={1.5} unit="h" />
            <Given label="Rate" value={34.4} unit="€/h" />
          </Product>
          <Given label="Material" value={4.68} unit="€" />
        </Sum>
      </Calculation>,
    );
    const text = container.textContent!;
    expect(text).toContain("51.60");
    expect(text).toContain("56.28");
    expect(text).toContain("1.5");
    expect(text).not.toContain("1.50");
  });
});
