import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@umriss-ui/core";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { Calculation, Given, Product, Quotient, Sum } from "../src";
import { costing } from "./costing";
import { OeeCalculation } from "./oee";

/** Every row a reader sees, as "operator label amount unit", top to bottom. */
const rows = () =>
  [...document.querySelectorAll("li > div")]
    .filter((row) => !row.closest("ul[hidden]"))
    .map((row) => {
      const cell = (name: string) => row.querySelector(`:scope > [class*="${name}"]`)?.textContent ?? "";
      return [cell("operator"), cell("labelCell"), cell("amount"), cell("unit")].join(" ").replace(/\s+/g, " ").trim();
    });
/** The row of a quantity, found by its label - a visible one first. */
const rowOf = (label: string) => {
  const all = [...document.querySelectorAll<HTMLElement>("li > div")].filter(
    (row) => row.querySelector(":scope > [class*=labelCell]")?.textContent === label,
  );
  return all.find((row) => !row.closest("ul[hidden]")) ?? all[0]!;
};
/** What stands beneath the label. */
const notesOf = (label: string) => rowOf(label).querySelector(":scope > [class*=notes]")?.textContent ?? "";
const toggle = (label: string) => screen.getByRole("button", { name: new RegExp(`how ${label} is derived`) });

describe("The statement", () => {
  it("stands a result beneath its operands, with the operator before each number", () => {
    render(<OeeCalculation />);
    expect(rows()).toEqual(["Availability 91.6 %", "× Performance 93.2 %", "× Quality 96 %", "OEE 82 %"]);
    expect(rowOf("OEE").hasAttribute("data-rule")).toBe(true);
    expect(rowOf("OEE").getAttribute("data-kind")).toBe("result");
  });

  it("folds a chain to its interims, and unfolds one by its label", () => {
    render(<Calculation>{costing()}</Calculation>);
    expect(rows()).toEqual([
      "Material cost 2,060.8 €",
      "Production cost 4,172.8 €",
      "Cost price 4,798.72 €",
      "Net offer price 5,182.62 €",
    ]);
    fireEvent.click(toggle("Production cost"));
    expect(rows()).toEqual([
      "Material cost 2,060.8 €",
      "Production cost 4,172.8 €",
      "Material cost 2,060.8 €",
      "+ Direct labour 960 €",
      "+ Production overhead 1,152 €",
      "= Production cost 4,172.8 €",
      "Cost price 4,798.72 €",
      "Net offer price 5,182.62 €",
    ]);
    expect(notesOf("Production overhead")).toBe("= Production overhead rate × Direct labour");
    expect(notesOf("Production cost")).toBe("");
    fireEvent.click(toggle("Net offer price"));
    expect(rows().slice(-4)).toEqual([
      "Net offer price 5,182.62 €",
      "Cost price 4,798.72 €",
      "× Profit mark-up 1.08",
      "= Net offer price 5,182.62 €",
    ]);
  });

  it("shows the formula in names beneath a folded label, and a count above four operands", () => {
    render(
      <Calculation>
        <Product label="Cost of the order">
          <Sum label="Cost per piece">
            {["Steel", "Paint", "Screws", "Energy", "Labour"].map((name) => (
              <Given key={name} label={name} value={1} />
            ))}
          </Sum>
          <Given label="Pieces" value={10} />
        </Product>
      </Calculation>,
    );
    expect(notesOf("Cost per piece")).toBe("5 operands");
    expect(screen.getByText(/^Cost per piece equals/).textContent).toBe(
      "Cost per piece equals Steel plus Paint plus Screws plus Energy plus Labour, equals 1 plus 1 plus 1 plus 1 plus 1, equals 5",
    );
    fireEvent.click(toggle("Cost per piece"));
    expect(notesOf("Cost per piece")).toBe("");
    expect(rows()).toContain("+ Paint 1");
  });

  it("shows a reference with the referred quantity's label and number, not its derivation", () => {
    render(<OeeCalculation />);
    fireEvent.click(toggle("Performance"));
    expect(rows().slice(1, 5)).toEqual([
      "× Performance 93.2 %",
      "Ideal run time 384 min",
      "÷ Run time 412 min",
      "= Performance 93.2 %",
    ]);
    expect(rowOf("Run time").hasAttribute("data-reference")).toBe(true);
  });

  it("indents only an inner derivation, and keeps the fold on its quantity when data changes", () => {
    const { rerender } = render(<OeeCalculation />);
    fireEvent.click(toggle("Availability"));
    expect(rowOf("Run time").style.getPropertyValue("--depth")).toBe("1");
    expect(rowOf("Run time").hasAttribute("data-inner")).toBe(true);
    expect(rowOf("Downtime").style.getPropertyValue("--depth")).toBe("2");
    expect(rowOf("Availability").style.getPropertyValue("--depth")).toBe("0");

    rerender(<OeeCalculation downtime={50} />);
    expect(toggle("Availability").getAttribute("aria-expanded")).toBe("true");
    expect(toggle("Performance").getAttribute("aria-expanded")).toBe("false");
    const list = document.getElementById(toggle("Availability").getAttribute("aria-controls")!)!;
    fireEvent.click(toggle("Availability")); // a button: Enter and Space arrive as a click
    expect(list.hidden).toBe(true);
  });

  it("keeps a fold on its quantity when an item is added before it", () => {
    const costs = (names: string[]) => (
      <Calculation>
        <Sum label="Total">
          {names.map((name) => (
            <Product key={name} label={name}>
              <Given label={`${name} a`} value={1} />
              <Given label={`${name} b`} value={2} />
            </Product>
          ))}
        </Sum>
      </Calculation>
    );
    const { rerender } = render(costs(["Energy", "Labour"]));
    fireEvent.click(toggle("Labour"));
    rerender(costs(["Material", "Energy", "Labour"]));
    expect(toggle("Material").getAttribute("aria-expanded")).toBe("false");
    expect(toggle("Energy").getAttribute("aria-expanded")).toBe("false");
    expect(toggle("Labour").getAttribute("aria-expanded")).toBe("true");
  });

  it("marks a folded quantity whose derivation holds a worse verdict", () => {
    render(
      <Calculation>
        <Sum label="Total">
          <Product label="Scrap cost">
            <Given label="Scrap" value={12} limits={[{ value: 10, side: "upper", severity: "alarm" }]} />
            <Given label="Price" value={3} />
          </Product>
          <Given label="Base" value={1} />
        </Sum>
      </Calculation>,
    );
    expect(notesOf("Scrap cost")).toContain("Inside: Alarm limit exceeded");
    fireEvent.click(toggle("Scrap cost"));
    expect(notesOf("Scrap cost")).not.toContain("Inside");
  });

  it("shows an absent given through to the result, with the reason, never as zero", () => {
    render(<OeeCalculation downtime={null} />);
    expect(rows().at(-1)).toBe("OEE —");
    expect(notesOf("OEE")).toBe("Downtime is missing");
    expect(rowOf("OEE").querySelector("[aria-hidden]")).not.toBeNull();
    expect(screen.getByText(/^OEE equals/).textContent).toBe(
      "OEE equals Availability times Performance times Quality, equals No value times No value times 96 percent, equals No value, Downtime is missing",
    );
  });
});

describe("The accessible sentence", () => {
  it("reads a derived line with its target", () => {
    render(
      <Calculation>
        <Quotient label="Availability" format="percent" target={0.9}>
          <Given label="Run time" value={412} unit="min" />
          <Given label="Planned production time" value={450} unit="min" />
        </Quotient>
      </Calculation>,
    );
    expect(screen.getByText(/^Availability equals/).textContent).toBe(
      "Availability equals Run time divided by Planned production time, equals 412 min divided by 450 min, equals 91.6 percent, above target 90 percent",
    );
    expect(screen.getByText(/^Run time equals/).textContent).toBe("Run time equals 412 min");
  });

  it("reads an approximated result, and in German", () => {
    const thirds = (
      <Calculation>
        <Sum label="Whole">
          {["a", "b", "c"].map((key) => (
            <Quotient key={key} label={`Third ${key}`}>
              <Given label="one" value={1} />
              <Given label="three" value={3} />
            </Quotient>
          ))}
        </Sum>
      </Calculation>
    );
    const { unmount } = render(thirds);
    expect(screen.getByText(/^Whole equals/).textContent).toBe(
      "Whole equals Third a plus Third b plus Third c, equals 0.33 plus 0.33 plus 0.33, equals approximately 1",
    );
    expect(rows().at(-1)).toBe("≈ Whole 1");
    unmount();

    render(<LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>{thirds}</LanguageProvider>);
    expect(screen.getByText(/^Whole gleich/).textContent).toBe(
      "Whole gleich Third a plus Third b plus Third c, gleich 0,33 plus 0,33 plus 0,33, gleich ungefähr 1",
    );
  });

  it("reads the lines of a chain with their operator, in English and German", () => {
    const { unmount } = render(<Calculation>{costing()}</Calculation>);
    fireEvent.click(toggle("Production cost"));
    expect(screen.getByText(/^plus Direct labour/).textContent).toBe("plus Direct labour equals 960 €");
    expect(screen.getByText(/^Production cost equals Material/).textContent).toBe(
      "Production cost equals Material cost plus Direct labour plus Production overhead, equals 2,060.8 € plus 960 € plus 1,152 €, equals 4,172.8 €",
    );
    unmount();
    render(<LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}><Calculation>{costing()}</Calculation></LanguageProvider>);
    expect(screen.getByText(/^mal Profit/).textContent).toBe("mal Profit mark-up gleich 1,08");
  });

  it("reads the reason of an absent quantity, in German", () => {
    render(
      <LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>
        <Calculation>
          <Quotient label="Ausbeute" format="percent">
            <Given label="Gutteile" value={null} unit="Stk" />
            <Given label="Gesamt" value={480} unit="Stk" />
          </Quotient>
        </Calculation>
      </LanguageProvider>,
    );
    expect(screen.getByText(/^Ausbeute gleich/).textContent).toBe(
      "Ausbeute gleich Gutteile geteilt durch Gesamt, gleich Kein Wert geteilt durch 480 Stk, gleich Kein Wert, Gutteile fehlt",
    );
  });
});

describe("Hover coupling", () => {
  it("marks the operands and every place a quantity is used, on hover and on focus", () => {
    render(<OeeCalculation />);
    fireEvent.click(toggle("Availability"));
    fireEvent.click(toggle("Performance"));
    const runTime = toggle("Run time");
    const marks = () =>
      [...document.querySelectorAll("[data-mark]")].map(
        (line) => `${line.getAttribute("data-mark")}: ${line.querySelector("span[class*=label]")!.textContent}`,
      );

    fireEvent.pointerEnter(runTime.parentElement!.parentElement!);
    expect(marks()).toEqual([
      "use: Run time",
      "operand: Planned production time",
      "operand: Downtime",
      "use: = Run time",
      "use: Run time",
    ]);
    fireEvent.pointerLeave(runTime.parentElement!.parentElement!);
    expect(marks()).toEqual([]);

    fireEvent.focus(toggle("Quality"));
    expect(marks()).toEqual(["use: Quality", "operand: Good count", "operand: Total count", "use: = Quality"]);
    fireEvent.blur(toggle("Quality"));
    expect(marks()).toEqual([]);
  });
});
