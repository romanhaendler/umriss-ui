import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { LanguageProvider } from "@umriss-ui/core";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { Calculation, Given, Product, Quotient, Sum } from "../src";
import { OeeCalculation } from "./oee";

/** The line of a quantity, found by its accessible sentence. */
const lineOf = (start: string) => screen.getByText((text) => text.startsWith(`${start} `)).parentElement!;
const toggle = (label: string) => screen.getByRole("button", { name: new RegExp(`how ${label} is derived`) });

describe("Lines", () => {
  it("shows a derived line with its formula in names and in numbers, and the result", () => {
    render(<OeeCalculation />);
    const line = lineOf("Availability");
    expect(line.textContent).toContain("Availability= Run time ÷ Planned production time= 412 min ÷ 450 min91.6 %");
  });

  it("shows a reference with the referred quantity's label and number, not its derivation", () => {
    render(<OeeCalculation />);
    fireEvent.click(toggle("Performance"));
    const references = screen.getAllByText("Run time equals 412 min");
    expect(references).toHaveLength(1);
    expect(references[0]!.parentElement!.textContent).toBe("Run time equals 412 minRun time412 min");
  });

  it("opens the level under the result and folds everything below", () => {
    render(<OeeCalculation />);
    expect(toggle("OEE").getAttribute("aria-expanded")).toBe("true");
    for (const label of ["Availability", "Performance", "Quality"]) {
      expect(toggle(label).getAttribute("aria-expanded"), label).toBe("false");
    }
    expect(screen.getByText(/^Downtime equals/).closest("ul")!.hidden).toBe(true);
  });

  it("folds and unfolds, by click and by keyboard, and keeps the state when data changes", () => {
    const { rerender } = render(<OeeCalculation />);
    const availability = toggle("Availability");
    fireEvent.click(availability);
    expect(availability.getAttribute("aria-expanded")).toBe("true");
    const list = document.getElementById(availability.getAttribute("aria-controls")!)!;
    expect(list.hidden).toBe(false);
    expect(within(list).getByText(/^Downtime equals 38 min/)).toBeTruthy();

    rerender(<OeeCalculation downtime={50} />);
    expect(toggle("Availability").getAttribute("aria-expanded")).toBe("true");
    expect(toggle("Performance").getAttribute("aria-expanded")).toBe("false");

    availability.focus();
    fireEvent.click(availability); // a button: Enter and Space arrive as a click
    expect(list.hidden).toBe(true);
    fireEvent.click(toggle("OEE"));
    expect(toggle("OEE").getAttribute("aria-expanded")).toBe("false");
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
    const line = toggle("Scrap cost").parentElement!;
    expect(line.querySelector("[data-verdict='alarm']")!.textContent).toBe("Inside: Alarm limit exceeded");
    fireEvent.click(toggle("Scrap cost"));
    expect(line.textContent).not.toContain("Inside");
  });

  it("shows an absent given through to the result, with the reason, never as zero", () => {
    render(<OeeCalculation downtime={null} />);
    const result = lineOf("OEE");
    expect(result.textContent).toContain("—");
    expect(result.nextElementSibling!.textContent).toBe("Downtime is missing");
    expect(result.nextElementSibling!.firstElementChild!.getAttribute("aria-hidden")).toBe("true");
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
    expect(lineOf("Whole").textContent).toContain("≈ 1");
    unmount();

    render(<LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>{thirds}</LanguageProvider>);
    expect(screen.getByText(/^Whole gleich/).textContent).toBe(
      "Whole gleich Third a plus Third b plus Third c, gleich 0,33 plus 0,33 plus 0,33, gleich ungefähr 1",
    );
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

    fireEvent.pointerEnter(runTime.parentElement!);
    expect(marks()).toEqual([
      "use: Run time",
      "operand: Planned production time",
      "operand: Downtime",
      "use: Run time",
    ]);
    fireEvent.pointerLeave(runTime.parentElement!);
    expect(marks()).toEqual([]);

    fireEvent.focus(toggle("Quality"));
    expect(marks()).toEqual(["use: Quality", "operand: Good count", "operand: Total count"]);
    fireEvent.blur(toggle("Quality"));
    expect(marks()).toEqual([]);
  });
});
