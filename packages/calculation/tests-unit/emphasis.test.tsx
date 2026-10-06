import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Calculation, Chain, Given, Interim, Plus, Sum } from "../src";
import { STAFF } from "./staff";

const rowOf = (label: string) =>
  [...document.querySelectorAll<HTMLElement>("li > div")].find(
    (row) => !row.closest("ul[hidden]") && row.querySelector(":scope > [class*=labelCell]")?.textContent === label,
  )!;
const look = (label: string) => [rowOf(label).getAttribute("data-emphasis"), rowOf(label).hasAttribute("data-rule")];

describe("Emphasis and rule", () => {
  it("set a given, a tree's sum, a chain's line and an interim apart, and leave their sentences alone", () => {
    render(
      <Calculation aria-label="Offer">
        <Chain>
          <Given label="Direct material" value={1840} unit="€" emphasis="muted" />
          <Plus label="Material overhead" value={220.8} unit="€" rule="above" />
          <Plus>
            <Sum label="Labour" unit="€" emphasis="strong">
              <Given label="Assembly" value={600} unit="€" />
              <Given label="Testing" value={360} unit="€" />
            </Sum>
          </Plus>
          <Interim label="Production cost" unit="€" emphasis="strong" rule="above" />
          <Plus label="Freight" value={120} unit="€" />
          <Interim label="Offer price" unit="€" />
        </Chain>
      </Calculation>,
    );
    expect(look("Direct material")).toEqual(["muted", false]);
    expect(look("Material overhead")).toEqual([null, true]);
    expect(look("Labour")).toEqual(["strong", false]);
    expect(look("Production cost")).toEqual(["strong", true]);
    expect(look("Freight")).toEqual([null, false]);
    expect(screen.getByText(/^Direct material equals/).textContent).toBe("Direct material equals 1,840 €");
  });

  it("reach a line inside an opened derivation, and with metrics", () => {
    render(
      <Calculation aria-label="Staff" metrics={STAFF}>
        <Chain>
          <Given label="Staff on 30 June" value={{ heads: 64, fte: 48.9 }} />
          <Plus>
            <Sum label="Movements" rule="above">
              <Given label="Joiners" value={{ heads: 6, fte: 5.8 }} emphasis="strong" />
              <Given label="Students" value={{ heads: 2, fte: 0.5 }} emphasis="muted" />
            </Sum>
          </Plus>
          <Interim label="Staff on 30 September" />
        </Chain>
      </Calculation>,
    );
    expect(look("Movements")).toEqual([null, true]);
    fireEvent.click(screen.getByRole("button", { name: "Show how Movements is derived" }));
    expect(look("Joiners")).toEqual(["strong", false]);
    expect(look("Students")).toEqual(["muted", false]);
  });

  it("fail on the Result, which is already the heaviest line", () => {
    const sum = (props: object) => (
      <Calculation>
        <Sum label="Output" {...props}>
          <Given label="Early shift" value={512} />
          <Given label="Late shift" value={488} />
        </Sum>
      </Calculation>
    );
    expect(() => render(sum({ emphasis: "strong" }))).toThrow(
      "<Calculation> › Output: emphasis and rule do not stand on the Result, which is already the heaviest line.",
    );
    expect(() => render(sum({ rule: "above" }))).toThrow("emphasis and rule do not stand on the Result");
    expect(() =>
      render(
        <Calculation>
          <Chain>
            <Given label="Net" value={100} />
            <Plus label="VAT" value={19} />
            <Interim label="Gross" emphasis="muted" />
          </Chain>
        </Calculation>,
      ),
    ).toThrow("<Calculation> › Gross: emphasis and rule do not stand on the Result");
  });
});
