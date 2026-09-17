/* Defaults by value type, `format`, `footer` (umriss-table 07).

   Rendered under a UmrissProvider with formats that differ from the German
   ones: only that way is it visible that the cells use the seam and not
   formatters of their own. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { UmrissProvider } from "@umriss-ui/core";
import { useTable } from "../src";
import type { Table } from "../src";

interface Reading {
  id: string;
  name: string;
  amount: number;
  share: number | null;
  measuredAt: Date;
  checked: boolean;
  code: string;
  gap: number | null;
}

const READINGS: Reading[] = [
  { id: "1", name: "Basalt", amount: 1204.5, share: 0.4, measuredAt: new Date(Date.UTC(2026, 2, 17, 8)), checked: true, code: "K-9", gap: null },
  { id: "2", name: "Änderung", amount: 3, share: null, measuredAt: new Date(Date.UTC(2026, 2, 16, 8)), checked: false, code: "K-10", gap: 4 },
  { id: "3", name: "Cirrus", amount: 10, share: 0.5, measuredAt: new Date(Date.UTC(2026, 2, 18, 8)), checked: true, code: "K-2", gap: 2 },
];

const LANGUAGE = {
  formats: {
    number: (n: number, k?: number) => `Z${n}${k === undefined ? "" : `/${k}`}`,
    percent: (n: number) => `P${n}`,
    dateTime: (d: Date) => `DT${d.getUTCDate()}`,
    date: (d: Date) => `D${d.getUTCDate()}`,
    /* Reversed: that way it is visible from the order that the sort uses the
       provider's comparison. */
    compareText: (a: string, b: string) => b.localeCompare(a, "de"),
  },
  wording: { booleanYes: "yes", booleanNo: "no" },
};

let current: Table<Reading> | null = null;
const capture = (t: Table<Reading>) => {
  current = t;
};

function Log({ rows = READINGS }: { rows?: Reading[] }) {
  const table = useTable(rows, { rowKey: (m) => m.id });
  capture(table);
  const { Table: Frame, Column } = table;
  return (
    <Frame>
      <Column value="name" label="Name" rowHeader />
      <Column value="amount" label="Menge" footer="sum" />
      <Column value="share" label="Anteil" format="percent" footer="avg" />
      <Column value="measuredAt" label="Gemessen" />
      <Column value="checked" label="Geprüft" />
      <Column value="code" label="Kennung" numeric />
      <Column value="gap" label="Lücke" />
    </Frame>
  );
}

const withProvider = (children: ReactNode) => <UmrissProvider language={LANGUAGE}>{children}</UmrissProvider>;

const cell = (root: HTMLElement, row: number, column: string) => {
  const index = Array.from(root.querySelectorAll("thead th")).findIndex((th) => th.getAttribute("data-column") === column);
  return root.querySelectorAll("tbody > tr")[row]!.children[index] as HTMLElement;
};

const rowHeaderTexts = (root: HTMLElement) =>
  Array.from(root.querySelectorAll("tbody th")).map((z) => z.textContent);

const isRight = (z: HTMLElement) => z.className.includes("numeric");

describe("Text", () => {
  it("stands as it is, on the left, and sorts with the provider's comparison", () => {
    const { container } = render(withProvider(<Log />));
    expect(cell(container, 0, "name").textContent).toBe("Basalt");
    expect(isRight(cell(container, 0, "name"))).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Name" }));
    expect(rowHeaderTexts(container)).toEqual(["Cirrus", "Basalt", "Änderung"]);
  });

  it("by German collation without a provider", () => {
    const { container } = render(<Log />);
    fireEvent.click(screen.getByRole("button", { name: "Name" }));
    expect(rowHeaderTexts(container)).toEqual(["Änderung", "Basalt", "Cirrus"]);
  });
});

describe("Number", () => {
  it("writes with formats.number, on the right, and sorts numerically", () => {
    const { container } = render(withProvider(<Log />));
    expect(cell(container, 0, "amount").textContent).toBe("Z1204.5");
    expect(isRight(cell(container, 0, "amount"))).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Menge" }));
    expect(rowHeaderTexts(container)).toEqual(["Änderung", "Cirrus", "Basalt"]);
  });

  it("takes a named format and keeps alignment and footer", () => {
    const { container } = render(withProvider(<Log />));
    expect(cell(container, 0, "share").textContent).toBe("P0.4");
    expect(isRight(cell(container, 0, "share"))).toBe(true);
    const footer = container.querySelector('tfoot td[data-footer="avg"]')!;
    // The average of 0.4 and 0.5 - the absent value does not count towards it.
    expect(footer.textContent).toContain("P0.45");
    expect(footer.textContent).toContain("Average");
  });

  it("sums over the filtered set, not over the page", () => {
    const { container } = render(withProvider(<Log />));
    expect(container.querySelector('tfoot td[data-footer="sum"]')!.textContent).toContain("Z1217.5");
    act(() => current!.setSearch("sal"));
    expect(container.querySelector('tfoot td[data-footer="sum"]')!.textContent).toContain("Z1204.5");
  });
});

describe("Point in time", () => {
  it("writes with formats.dateTime, on the left, and sorts by the time", () => {
    const { container } = render(withProvider(<Log />));
    expect(cell(container, 0, "measuredAt").textContent).toBe("DT17");
    expect(isRight(cell(container, 0, "measuredAt"))).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Gemessen" }));
    expect(rowHeaderTexts(container)).toEqual(["Änderung", "Basalt", "Cirrus"]);
  });
});

describe("Boolean", () => {
  it("writes the word from the wording and sorts false before true", () => {
    const { container } = render(withProvider(<Log />));
    expect(cell(container, 0, "checked").textContent).toBe("yes");
    expect(cell(container, 1, "checked").textContent).toBe("no");
    fireEvent.click(screen.getByRole("button", { name: "Geprüft" }));
    expect(rowHeaderTexts(container)[0]).toBe("Änderung");
  });
});

describe("Alignment at runtime", () => {
  it("follows the first value present, and numeric wins", () => {
    const { container } = render(withProvider(<Log />));
    // The first row has no value; the second one decides.
    expect(isRight(cell(container, 0, "gap"))).toBe(true);
    expect(isRight(cell(container, 0, "code"))).toBe(true);
  });
});

describe("Absent values", () => {
  it("show the muted dash and the word, and stand last", () => {
    const { container } = render(withProvider(<Log />));
    const empty = cell(container, 0, "gap");
    expect(empty.textContent).toBe("—No value");
    const gap = screen.getByRole("button", { name: "Lücke" });
    fireEvent.click(gap);
    expect(rowHeaderTexts(container)).toEqual(["Cirrus", "Änderung", "Basalt"]);
    fireEvent.click(gap);
    expect(rowHeaderTexts(container)).toEqual(["Änderung", "Cirrus", "Basalt"]);
  });
});

describe("Export", () => {
  it("leaves numbers as numbers with a decimal comma - even behind a percent format", () => {
    render(<Log />);
    const lines = current!.asCsv().replace("﻿", "").split("\r\n");
    expect(lines[0]).toBe("Name;Menge;Anteil;Gemessen;Geprüft;Kennung;Lücke");
    expect(lines[1]).toBe("Basalt;1204,5;0,4;2026-03-17T08:00:00.000Z;ja;K-9;");
    expect(lines[2]).toBe("Änderung;3;;2026-03-16T08:00:00.000Z;nein;K-10;4");
  });

  it("contains the filtered set in the visible columns and their order", () => {
    render(<Log />);
    act(() => {
      current!.setSearch("Cirrus");
      current!.toggleColumn("measuredAt");
      current!.setOrder(["amount"]);
    });
    const lines = current!.asCsv().replace("﻿", "").split("\r\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe("Menge;Name;Anteil;Geprüft;Kennung;Lücke");
    expect(lines[1]).toBe("10;Cirrus;0,5;ja;K-2;2");
  });

  it("without a provider the cell writes German", () => {
    const { container } = render(<Log />);
    // The German notation, written by hand - not through the formatter the cell itself uses.
    expect(cell(container, 0, "amount").textContent).toBe("1.204,5");
  });
});
