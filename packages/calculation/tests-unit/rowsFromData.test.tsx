import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@umriss-ui/core";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { Calculation, Chain, Difference, Given, Interim, Minus, Plus, Product, Quotient, Ref, Sum, Times } from "../src";

/** Every row a reader sees, as "operator label amount unit", top to bottom. */
const rows = () =>
  [...document.querySelectorAll("li > div")]
    .filter((row) => !row.closest("ul[hidden]"))
    .map((row) => {
      const cell = (name: string) => row.querySelector(`:scope > [class*="${name}"]`)?.textContent ?? "";
      return [cell("operator"), cell("labelCell"), cell("amount"), cell("unit")].join(" ").replace(/\s+/g, " ").trim();
    });
const rowOf = (label: string) =>
  [...document.querySelectorAll<HTMLElement>("li > div")].find(
    (row) => !row.closest("ul[hidden]") && row.querySelector(":scope > [class*=labelCell]")?.textContent === label,
  )!;
const formulaOf = (label: string) => rowOf(label).querySelector(":scope > [class*=names]")?.textContent ?? "";
const open = (label: string) => fireEvent.click(screen.getByRole("button", { name: `Show how ${label} is derived` }));

interface Row {
  id: string;
  name: string;
  amount: number;
}

/** A payslip with a group of corrections from data, whatever their count. */
const payslip = (corrections: readonly Row[]) => (
  <Calculation aria-label="Payslip">
    <Chain>
      <Given label="Gross salary" value={4200} unit="€" decimals={2} />
      <Minus label="Income tax" value={612.5} unit="€" decimals={2} />
      <Plus>
        <Sum label="Corrections" unit="€" decimals={2}>
          {corrections.map((c) => (
            <Given key={c.id} label={c.name} value={c.amount} unit="€" decimals={2} />
          ))}
        </Sum>
      </Plus>
      <Interim label="Net salary" unit="€" decimals={2} />
    </Chain>
  </Calculation>
);

describe("A sum of any count", () => {
  it("stands an empty sum as zero, with nothing to open, and says it has no entries", () => {
    render(payslip([]));
    expect(rows()).toEqual([
      "Gross salary 4,200.00 €",
      "− Income tax 612.50 €",
      "+ Corrections 0.00 €",
      "Net salary 3,587.50 €",
    ]);
    expect(formulaOf("Corrections")).toBe("no entries");
    expect(screen.queryByRole("button", { name: /Corrections/ })).toBeNull();
    expect(screen.getByText(/^plus Corrections/).textContent).toBe("plus Corrections equals no entries, equals 0.00 €");
  });

  it("folds a sum of one and opens it onto that one, closing on its name", () => {
    render(payslip([{ id: "c1", name: "Night work bonus", amount: 84 }]));
    expect(formulaOf("Corrections")).toBe("= Night work bonus");
    open("Corrections");
    expect(rows()).toEqual([
      "Gross salary 4,200.00 €",
      "− Income tax 612.50 €",
      "+ Corrections 84.00 €",
      "Night work bonus 84.00 €",
      "= Corrections 84.00 €",
      "Net salary 3,671.50 €",
    ]);
  });

  it("keeps the statement's shape as rows come and go, and an opened group open", () => {
    const { rerender } = render(payslip([{ id: "c1", name: "Night work bonus", amount: 84 }]));
    open("Corrections");
    rerender(
      payslip([
        { id: "c1", name: "Night work bonus", amount: 84 },
        { id: "c2", name: "Holiday pay", amount: 120 },
      ]),
    );
    expect(rows()).toContain("+ Holiday pay 120.00 €");
    rerender(payslip([]));
    expect(rows()).toContain("+ Corrections 0.00 €");
    expect(formulaOf("Corrections")).toBe("no entries");
  });

  it("takes a sum of one written by hand", () => {
    render(
      <Calculation>
        <Sum label="Output" unit="pcs">
          <Given label="Early shift" value={512} unit="pcs" />
        </Sum>
      </Calculation>,
    );
    expect(rows()).toEqual(["Early shift 512 pcs", "Output 512 pcs"]);
  });

  it("says so where the empty sum is the Result itself", () => {
    render(
      <Calculation aria-label="Corrections">
        <Sum label="Corrections" unit="€">
          {[]}
        </Sum>
      </Calculation>,
    );
    expect(rows()).toEqual(["Corrections 0 €"]);
    expect(formulaOf("Corrections")).toBe("no entries");
    expect(document.querySelectorAll("ul ul")).toHaveLength(0);
  });

  it("says in German that a group has no entries", () => {
    render(
      <LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>
        {payslip([])}
      </LanguageProvider>,
    );
    expect(formulaOf("Corrections")).toBe("keine Einträge");
  });

  it("keeps the operand counts of a difference, a product and a quotient", () => {
    const one = <Given label="A" value={1} />;
    expect(() => render(<Calculation><Difference label="D">{one}</Difference></Calculation>)).toThrow(
      "<Calculation> › D: <Difference> takes two or more operands; it was given 1.",
    );
    expect(() => render(<Calculation><Product label="P">{[]}</Product></Calculation>)).toThrow(
      "<Calculation> › P: <Product> takes two or more operands; it was given 0.",
    );
    expect(() => render(<Calculation><Quotient label="Q">{one}</Quotient></Calculation>)).toThrow(
      "<Calculation> › Q: <Quotient> takes exactly two operands; it was given 1.",
    );
  });
});

const CORRECTIONS: readonly Row[] = [
  { id: "c1", name: "Night work bonus", amount: 84 },
  { id: "c2", name: "Overpaid travel, February", amount: -120 },
  { id: "c3", name: "Rounding", amount: 0.03 },
];

describe("A line shows its contribution", () => {
  it("turns a negative group into a minus with its number unsigned, and closes it with its own sign", () => {
    render(payslip(CORRECTIONS));
    expect(rows()).toEqual([
      "Gross salary 4,200.00 €",
      "− Income tax 612.50 €",
      "− Corrections 35.97 €",
      "Net salary 3,551.53 €",
    ]);
    open("Corrections");
    expect(rows()).toEqual([
      "Gross salary 4,200.00 €",
      "− Income tax 612.50 €",
      "− Corrections 35.97 €",
      "Night work bonus 84.00 €",
      "− Overpaid travel, February 120.00 €",
      "+ Rounding 0.03 €",
      "= Corrections -35.97 €",
      "Net salary 3,551.53 €",
    ]);
  });

  it("writes the folded formula and the sentence with the drawn operators", () => {
    render(payslip(CORRECTIONS));
    expect(formulaOf("Corrections")).toBe("= Night work bonus − Overpaid travel, February + Rounding");
    expect(screen.getByText(/^minus Corrections/).textContent).toBe(
      "minus Corrections equals Night work bonus minus Overpaid travel, February plus Rounding, equals 84.00 € minus 120.00 € plus 0.03 €, equals 35.97 €",
    );
    expect(screen.getByText(/^minus Overpaid travel/).textContent).toBe("minus Overpaid travel, February equals 120.00 €");
  });

  it("draws a minus before a first operand that lowers the sum, and nothing before one that raises it", () => {
    render(
      <Calculation>
        <Sum label="Balance" unit="€">
          <Given label="Refund" value={-30} unit="€" />
          <Given label="Bonus" value={12} unit="€" />
        </Sum>
      </Calculation>,
    );
    expect(rows()).toEqual(["− Refund 30 €", "+ Bonus 12 €", "Balance -18 €"]);
  });

  it("turns the subtrahend of a difference that is negative into a plus", () => {
    render(
      <Calculation>
        <Difference label="Stock" unit="pcs">
          <Given label="Counted" value={120} unit="pcs" />
          <Given label="Booked out" value={-5} unit="pcs" />
        </Difference>
      </Calculation>,
    );
    expect(rows()).toEqual(["Counted 120 pcs", "+ Booked out 5 pcs", "Stock 125 pcs"]);
  });

  it("reads a chain's Plus of a negative number and Minus of a positive one alike", () => {
    render(
      <Calculation>
        <Chain>
          <Given label="Opening balance" value={-50} unit="€" />
          <Plus label="Credit note" value={-18} unit="€" />
          <Minus label="Fee" value={18} unit="€" />
          <Interim label="Closing balance" unit="€" />
        </Chain>
      </Calculation>,
    );
    expect(rows()).toEqual(["− Opening balance 50 €", "− Credit note 18 €", "− Fee 18 €", "Closing balance -86 €"]);
  });

  it("keeps a factor's sign, and the written operator on a line that is zero or missing", () => {
    render(
      <Calculation>
        <Chain>
          <Given label="Net" value={100} unit="€" />
          <Minus label="Discount" value={0} unit="€" />
          <Plus label="Surcharge" value={null} unit="€" />
          <Interim label="Subtotal" unit="€" />
          <Times label="Reversal" value={-1} />
          <Interim label="Credit" unit="€" />
        </Chain>
      </Calculation>,
    );
    expect(rows()).toEqual([
      "Net 100 €",
      "− Discount 0 €",
      "+ Surcharge —",
      "Subtotal —",
      "× Reversal -1",
      "Credit —",
    ]);
  });

  it("takes the direction from the number as shown: a line that rounds to zero keeps its written operator", () => {
    render(
      <Calculation>
        <Sum label="Total" unit="€" decimals={2}>
          <Given label="Base" value={10} unit="€" decimals={2} />
          <Given label="Rounding" value={-0.004} unit="€" decimals={2} />
        </Sum>
      </Calculation>,
    );
    expect(rows()).toEqual(["Base 10.00 €", "+ Rounding 0.00 €", "Total 10.00 €"]);
  });

  it("shows a reference's contribution on its line and the quantity's own sign where it is defined", () => {
    render(
      <Calculation>
        <Chain>
          <Given label="Revenue" value={200} unit="€" />
          <Plus>
            <Sum id="corrections" label="Corrections" unit="€">
              <Given label="Refund" value={-30} unit="€" />
              <Given label="Bonus" value={12} unit="€" />
            </Sum>
          </Plus>
          <Interim label="Adjusted revenue" unit="€" />
          <Minus>
            <Ref to="corrections" />
          </Minus>
          <Interim label="Without corrections" unit="€" />
        </Chain>
      </Calculation>,
    );
    expect(rows()).toEqual([
      "Revenue 200 €",
      "− Corrections 18 €",
      "Adjusted revenue 182 €",
      "+ Corrections 18 €",
      "Without corrections 200 €",
    ]);
  });

  it("assesses a negative quantity on its own signed value", () => {
    render(
      <Calculation>
        <Chain>
          <Given label="Budget" value={1000} unit="€" />
          <Minus>
            <Sum label="Variance" unit="€" limits={[{ value: -10, side: "lower", severity: "alarm" }]}>
              <Given label="Overrun" value={-40} unit="€" />
              <Given label="Saving" value={15} unit="€" />
            </Sum>
          </Minus>
          <Interim label="Left" unit="€" />
        </Chain>
      </Calculation>,
    );
    expect(rows()).toContain("+ Variance 25 €");
    expect(rowOf("Variance").querySelector(":scope > [class*=assessment]")?.textContent).toContain("Alarm limit exceeded");
  });
});
