/* VerdictColumn (umriss-table 12). */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DEFAULT_WORDING } from "@umriss-ui/core";
import type { LimitSet } from "@umriss-ui/core";
import { useTable } from "../src";
import type { Table } from "../src";
import source from "../src/VerdictColumn.tsx?raw";

interface MeasurePoint {
  id: string;
  feature: string;
  value: number | null;
}

const POINTS: MeasurePoint[] = [
  { id: "1", feature: "Alarm", value: 12.5 },
  { id: "2", feature: "OK", value: 9.5 },
  { id: "3", feature: "Empty", value: null },
  { id: "4", feature: "Warning", value: 10.3 },
  { id: "5", feature: "Not a number", value: Number.NaN },
];

const LIMITS: LimitSet = {
  limits: [
    { value: 10, side: "upper", severity: "warning" },
    { value: 12, side: "upper", severity: "alarm" },
  ],
};

let current: Table<MeasurePoint> | null = null;
const capture = (t: Table<MeasurePoint>) => {
  current = t;
};

function Log({ sortBy }: { sortBy?: "verdict" | "value" }) {
  const t = useTable(POINTS, { rowKey: (p) => p.id });
  capture(t);
  const { Table: Frame, Column, VerdictColumn } = t;
  return (
    <Frame>
      <Column value="feature" label="Feature" rowHeader />
      <VerdictColumn value="value" label="Value" limits={LIMITS} format={{ decimals: 1 }} sortBy={sortBy} />
    </Frame>
  );
}

const verdicts = (root: HTMLElement) =>
  Array.from(root.querySelectorAll("tbody [data-verdict]")).map((z) => z.getAttribute("data-verdict"));
const features = (root: HTMLElement) => Array.from(root.querySelectorAll("tbody th")).map((z) => z.textContent);

describe("the four verdicts", () => {
  it("shows each one, with a glyph and the word - not by colour alone", () => {
    const { container } = render(<Log />);
    expect(verdicts(container)).toEqual(["alarm", "ok", "unknown", "warning", "unknown"]);
    const cells = container.querySelectorAll("tbody [data-verdict]");
    expect(cells[0]!.textContent).toContain(DEFAULT_WORDING.verdictAlarm);
    expect(cells[1]!.textContent).toContain(DEFAULT_WORDING.verdictOk);
    expect(cells[3]!.textContent).toContain(DEFAULT_WORDING.verdictWarning);
    const glyphs = Array.from(cells).map((z) => z.querySelector('[aria-hidden="true"]')!.textContent);
    expect(new Set(glyphs).size).toBe(4);
  });

  it("an unknown verdict for null and NaN is a verdict, not an absent value", () => {
    const { container } = render(<Log />);
    const rows = container.querySelectorAll("tbody > tr");
    for (const index of [2, 4]) {
      const cell = rows[index]!.querySelector('[data-verdict="unknown"]');
      expect(cell).not.toBeNull();
      expect(cell!.textContent).toContain(DEFAULT_WORDING.verdictUnknown);
    }
  });

  it("shows the excess where a limit is violated", () => {
    const { container } = render(<Log />);
    const cells = container.querySelectorAll("tbody [data-verdict]");
    expect(cells[0]!.textContent).toContain("12,5");
    expect(cells[0]!.textContent).toContain("+0,5");
    expect(cells[3]!.textContent).toContain("+0,3");
    expect(cells[1]!.textContent).not.toContain("+");
  });
});

describe("Sorting and exporting", () => {
  it("sorts by the weight of the verdict", () => {
    const { container } = render(<Log />);
    fireEvent.click(screen.getByRole("button", { name: "Value" }));
    expect(features(container)).toEqual(["OK", "Empty", "Not a number", "Warning", "Alarm"]);
    fireEvent.click(screen.getByRole("button", { name: "Value" }));
    expect(features(container)[0]).toBe("Alarm");
  });

  it("or by the value, with the unknown ones last", () => {
    const { container } = render(<Log sortBy="value" />);
    fireEvent.click(screen.getByRole("button", { name: "Value" }));
    expect(features(container)).toEqual(["OK", "Warning", "Alarm", "Empty", "Not a number"]);
  });

  it("exports the value, not the verdict", () => {
    render(<Log />);
    const lines = current!.asCsv().replace("﻿", "").split("\r\n");
    expect(lines).toEqual(["Feature;Value", "Alarm;12,5", "OK;9,5", "Empty;", "Warning;10,3", "Not a number;"]);
  });
});

describe("built from the public interface", () => {
  it("imports nothing a caller of @umriss-ui/table could not import too", () => {
    const imports = [...source.matchAll(/from "([^"]+)"/g)].map(([, target]) => target);
    expect(imports.length).toBeGreaterThan(0);
    for (const target of imports) expect(["react", "@umriss-ui/core", "./VerdictColumn.module.css"]).toContain(target);
  });
});
