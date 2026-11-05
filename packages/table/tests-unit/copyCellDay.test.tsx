/* The single-cell copy writes what the row copy writes for that cell, in the plant's zone. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@umriss-ui/core";
import { useTable } from "../src";
import type { Table } from "../src";

const ROWS = [{ id: "a", name: "Pump", due: new Date("2026-10-23T22:00:00Z"), n: 1.5, ok: true }];
let current: Table<(typeof ROWS)[number]> | null = null;

const capture = (t: Table<(typeof ROWS)[number]>) => {
  current = t;
};

function Plant() {
  const t = useTable(ROWS, { rowKey: (r) => r.id });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame aria-label="Plant" selectable grid>
      <Column value="name" label="Name" rowHeader />
      <Column value="due" label="Due" />
      <Column value="n" label="N" />
      <Column value="ok" label="Ok" />
    </Frame>
  );
}

let writeText: ReturnType<typeof vi.fn>;
beforeEach(() => {
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
});
afterEach(() => Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true }));

describe("Ctrl+C on the Active cell", () => {
  it("writes a day, a number and a boolean as the row copy does, in the plant's zone", async () => {
    render(
      <LanguageProvider formats={{ timeZone: "Europe/Berlin" }}>
        <Plant />
      </LanguageProvider>,
    );
    const cell = screen.getByText("Pump").closest<HTMLElement>("th, td")!;
    act(() => cell.focus());
    const cells: string[] = [];
    for (let i = 0; i < 3; i++) {
      fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
      fireEvent.keyDown(document.activeElement!, { key: "c", ctrlKey: true });
      await act(async () => {});
      cells.push(writeText.mock.lastCall![0]);
    }
    act(() => current!.selection.toggle("a"));
    const [, row] = current!.selectionAsText().split("\n");
    expect(cells).toEqual(["2026-10-24", "1.5", "yes"]);
    expect(row!.split("\t").slice(1)).toEqual(cells);
  });
});
