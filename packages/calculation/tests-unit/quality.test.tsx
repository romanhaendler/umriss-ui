import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { Calculation, Chain, Given, Interim, Plus, Product, Ref, Sum, Times } from "../src";
import { evaluate } from "../src/evaluate";
import { perMetric, readCalculation } from "../src/model";
import { STAFF } from "./staff";

function run(children: ReactNode, metrics?: typeof STAFF) {
  const views = perMetric(readCalculation(children, metrics));
  const results = views.map((view) => evaluate(view));
  return (label: string, metric = 0) =>
    results[metric]!.get([...views[metric]!.quantities.values()].find((q) => q.label === label)!.key)!;
}

describe("The quality a quantity carries", () => {
  it("is the worst of two operands", () => {
    const of = run(
      <Sum label="Total">
        <Given label="A" value={1} quality="uncertain" />
        <Given label="B" value={2} quality="bad" />
      </Sum>,
    );
    expect(of("A").quality).toBe("uncertain");
    expect(of("Total").quality).toBe("bad");
  });

  it("counts an operand without quality as good", () => {
    const of = run(
      <Sum label="Total">
        <Given label="A" value={1} />
        <Given label="B" value={2} quality="uncertain" />
      </Sum>,
    );
    expect(of("A").quality).toBe("good");
    expect(of("Total").quality).toBe("uncertain");
  });

  it("goes down a tree", () => {
    const of = run(
      <Sum label="Total">
        <Product label="Inner">
          <Given label="A" value={2} quality="bad" />
          <Given label="B" value={3} />
        </Product>
        <Given label="C" value={1} />
      </Sum>,
    );
    expect(of("Total").quality).toBe("bad");
  });

  it("goes through a chain's interim and its written-in operands", () => {
    const of = run(
      <Chain>
        <Given label="A" value={2} quality="uncertain" />
        <Plus label="B" value={1} />
        <Interim label="Mid" />
        <Times label="C" value={3} quality="bad" />
        <Interim label="End" />
      </Chain>,
    );
    expect(of("Mid").quality).toBe("uncertain");
    expect(of("End").quality).toBe("bad");
  });

  it("is shown by a Ref as the quantity it stands for has it", () => {
    const of = run(
      <Sum label="Total">
        <Given id="a" label="A" value={2} quality="uncertain" />
        <Product label="Twice">
          <Ref to="a" />
          <Given label="Two" value={2} />
        </Product>
      </Sum>,
    );
    expect(of("Twice").quality).toBe("uncertain");
  });

  it("covers each number of a given with metrics", () => {
    const of = run(
      <Sum label="Total">
        <Given label="A" value={{ heads: 1, fte: 1 }} quality="bad" />
        <Given label="B" value={{ heads: 2, fte: null }} />
      </Sum>,
      STAFF,
    );
    expect(of("Total", 0).quality).toBe("bad");
    expect(of("Total", 1).quality).toBe("bad");
  });
});

const sheet = (quality?: "uncertain" | "bad") => (
  <Calculation aria-label="Sheet">
    <Sum label="Total">
      <Product label="Product">
        <Given label="Reading" value={4} quality={quality} />
        <Given label="Factor" value={2} />
      </Product>
      <Given label="Extra" value={1} />
    </Sum>
  </Calculation>
);
/** Every row's sentence, the visually hidden first span of each line. */
const sentences = () => [...document.querySelectorAll("li > div > span:first-child")].map((s) => s.textContent ?? "");

describe("The quality on a line", () => {
  it("says Bad quality on a bad given, in the line and its sentence", () => {
    render(sheet("bad"));
    expect(sentences()).toContain("Reading equals 4, Bad quality");
    expect(screen.getAllByText("Bad quality").length).toBeGreaterThan(0);
  });

  it("shows Uncertain quality on a folded result without opening it", () => {
    render(sheet("uncertain"));
    const row = [...document.querySelectorAll("li > div")].find(
      (r) => r.querySelector("[class*=labelCell]")?.textContent === "Product",
    )!;
    expect(row.querySelector("[class*=assessment]")?.textContent).toBe("Uncertain quality");
  });

  it("puts the word after the verdict and before the target in the sentence", () => {
    render(
      <Calculation aria-label="Sheet">
        <Product label="P" target={10} limits={[{ value: 10, side: "lower", severity: "alarm" }]}>
          <Given label="A" value={2} quality="uncertain" />
          <Given label="B" value={3} />
        </Product>
      </Calculation>,
    );
    const s = sentences().find((t) => t.startsWith("P equals"))!;
    const at = (word: string) => s.toLowerCase().indexOf(word);
    expect(at("alarm")).toBeGreaterThan(-1);
    expect(at("uncertain quality")).toBeGreaterThan(at("alarm"));
    expect(at("target")).toBeGreaterThan(at("uncertain quality"));
  });

  it("ends the sentence of a row with metrics", () => {
    render(
      <Calculation aria-label="Sheet" metrics={STAFF}>
        <Sum label="Total">
          <Given label="A" value={{ heads: 1, fte: 1 }} quality="bad" />
        </Sum>
      </Calculation>,
    );
    expect(sentences().some((s) => s.startsWith("Total") && s.endsWith("Bad quality"))).toBe(true);
  });

  it("leaves a calculation without quality as it was", () => {
    render(sheet());
    expect(document.body.textContent).not.toMatch(/quality/i);
  });

  it("survives structuredClone in the model", () => {
    const model = readCalculation(
      <Sum label="Total">
        <Given label="A" value={1} quality="bad" />
      </Sum>,
    );
    expect(structuredClone(model)).toEqual(model);
    expect([...model.quantities.values()].some((q) => q.given?.quality === "bad")).toBe(true);
  });
});
