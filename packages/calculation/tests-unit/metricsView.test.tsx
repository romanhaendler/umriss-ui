import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@umriss-ui/core";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { Calculation, Chain, Given, Interim, Minus, Plus } from "../src";
import { STAFF, staff } from "./staff";

/** Every row a reader sees, as "operator label" and each metric's number and
    unit, top to bottom; the head row first. */
const rows = () =>
  [...document.querySelectorAll("li > div")]
    .filter((row) => !row.closest("ul[hidden]"))
    .map((row) => {
      const cells = (name: string) => [...row.querySelectorAll(`:scope > [class*="${name}"]`)].map((cell) => cell.textContent);
      const head = [...row.querySelectorAll("[class*=headLabel], [class*=headUnit]")].map((cell) => cell.textContent);
      return [...head, ...cells("operator"), ...cells("labelCell"), ...interleave(cells("amount"), cells("unit"))]
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    });
const interleave = (a: string[], b: string[]) => a.flatMap((x, i) => [x, b[i] ?? ""]);
const rowOf = (label: string) =>
  [...document.querySelectorAll<HTMLElement>("li > div")].find(
    (row) => !row.closest("ul[hidden]") && row.querySelector(":scope > [class*=labelCell]")?.textContent === label,
  )!;
const assessmentOf = (label: string) => rowOf(label).querySelector(":scope > [class*=assessment]")?.textContent ?? "";
const open = (label: string) => fireEvent.click(screen.getByRole("button", { name: `Show how ${label} is derived` }));

describe("Metrics side by side", () => {
  it("stands a head above the figures, each metric with its unit, hidden from assistive technology", () => {
    render(<Calculation aria-label="Staff" metrics={STAFF}>{staff({ students: 3.2 })}</Calculation>);
    expect(rows()).toEqual([
      "Headcount HC Full-time equivalents FTE",
      "Production 96 84.5",
      "+ Logistics 64 48.9",
      "Industry 160 HC 133.4 FTE",
    ]);
    const head = document.querySelector("[class*=headCell]")!.closest("li")!;
    expect(head.getAttribute("aria-hidden")).toBe("true");
  });

  it("writes the unit where a result closes: the closing row, not the operands", () => {
    render(<Calculation aria-label="Staff" metrics={STAFF}>{staff({ students: 3.2 })}</Calculation>);
    open("Logistics");
    expect(rows().slice(2, 7)).toEqual([
      "+ Logistics 64 48.9",
      "Warehouse 40 31.6",
      "+ Dispatch 18 14.1",
      "+ Student staff 6 3.2",
      "= Logistics 64 HC 48.9 FTE",
    ]);
  });

  it("writes the unit on every interim of a chain in view", () => {
    render(
      <Calculation aria-label="Movement" metrics={STAFF}>
        <Chain>
          <Given label="Staff on 30 June" value={{ heads: 154, fte: 131.2 }} />
          <Plus label="Joiners" value={{ heads: 9, fte: 7.5 }} />
          <Interim label="Before leavers" />
          <Minus label="Leavers" value={{ heads: 3, fte: 2 }} />
          <Interim label="Staff on 30 September" />
        </Chain>
      </Calculation>,
    );
    expect(rows().slice(1)).toEqual([
      "Staff on 30 June 154 131.2",
      "+ Joiners 9 7.5",
      "Before leavers 163 HC 138.7 FTE",
      "− Leavers 3 2.0",
      "Staff on 30 September 160 HC 136.7 FTE",
    ]);
  });

  it("says briefly which metric is missing, on every row it makes absent", () => {
    const { unmount } = render(<Calculation aria-label="Staff" metrics={STAFF}>{staff()}</Calculation>);
    expect(rows().at(-1)).toBe("Industry 160 HC —");
    expect(assessmentOf("Logistics")).toBe("FTE is missing");
    expect(assessmentOf("Industry")).toBe("FTE is missing");
    expect(assessmentOf("Production")).toBe("");
    unmount();
    render(
      <LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>
        <Calculation aria-label="Staff" metrics={STAFF}>{staff()}</Calculation>
      </LanguageProvider>,
    );
    expect(assessmentOf("Industry")).toBe("FTE fehlt");
  });

  it("reads each row's formula once, then every metric's number, with the full reason", () => {
    render(<Calculation aria-label="Staff" metrics={STAFF}>{staff()}</Calculation>);
    expect(screen.getByText(/^Industry equals/).textContent).toBe(
      "Industry equals Production plus Logistics: Headcount 160 HC; Full-time equivalents No value, Student staff is missing",
    );
    open("Logistics");
    expect(screen.getByText(/^plus Dispatch/).textContent).toBe("plus Dispatch: Headcount 18 HC; Full-time equivalents 14.1 FTE");
  });

  it("reads in German", () => {
    render(
      <LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>
        <Calculation aria-label="Staff" metrics={STAFF}>{staff({ students: 3.2 })}</Calculation>
      </LanguageProvider>,
    );
    expect(screen.getByText(/^Industry gleich/).textContent).toBe(
      "Industry gleich Production plus Logistics: Headcount 160 HC; Full-time equivalents 133,4 FTE",
    );
  });
});
