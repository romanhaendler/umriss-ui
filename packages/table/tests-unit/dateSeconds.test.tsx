/* A Date column whose format says so shows seconds: the two names with seconds
   write the same text in the cell, in the list filter's entries, and keep the
   CSV's ISO timestamp. */

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LanguageProvider } from "@umriss-ui/core";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { useTable } from "../src";
import type { Table } from "../src";

interface Reading {
  id: string;
  at: Date;
}

const READINGS: Reading[] = [{ id: "a", at: new Date(2026, 2, 17, 9, 5, 3) }];

let current: Table<Reading> | null = null;
const capture = (t: Table<Reading>) => {
  current = t;
};

function Readings({ format }: { format: "dateTimeWithSeconds" | "timeWithSeconds" }) {
  const t = useTable(READINGS, { rowKey: (r) => r.id });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame aria-label="Readings">
      <Column value="at" label="At" rowHeader format={format} filter="list" />
    </Frame>
  );
}

describe("a Date column with seconds", () => {
  it("writes date, time and seconds in English", () => {
    render(<Readings format="dateTimeWithSeconds" />);
    expect(screen.getByText("17/03/2026, 09:05:03")).toBeTruthy();
  });

  it("writes the time with seconds alone", () => {
    render(<Readings format="timeWithSeconds" />);
    expect(screen.getByText("09:05:03")).toBeTruthy();
  });

  it("writes date, time and seconds in German", () => {
    render(
      <LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>
        <Readings format="dateTimeWithSeconds" />
      </LanguageProvider>,
    );
    expect(screen.getByText("17.03.2026, 09:05:03")).toBeTruthy();
  });

  it("writes the same text as the list filter's entry", () => {
    render(<Readings format="dateTimeWithSeconds" />);
    fireEvent.click(screen.getByRole("button", { name: "Filter At" }));
    const dialog = screen.getByRole("dialog", { name: "Filter At" });
    expect(within(dialog).getByText("17/03/2026, 09:05:03")).toBeTruthy();
  });

  it("keeps the CSV's ISO timestamp", () => {
    render(<Readings format="dateTimeWithSeconds" />);
    const text = current!.asCsv();
    expect(text).toContain(new Date(2026, 2, 17, 9, 5, 3).toISOString());
    expect(text).not.toContain("17/03/2026");
  });
});
