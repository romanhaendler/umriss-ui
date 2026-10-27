/* A selection a screen reader hears: in grid mode the rows say aria-selected,
   the grid says multiselectable, and a change by the user is announced as a
   count. A native table leaves the state to its checkboxes. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@umriss-ui/core";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { useTable } from "../src";
import type { Table } from "../src";

const PUMPS = [
  { id: "p1", name: "Pump 1" },
  { id: "p2", name: "Pump 2" },
  { id: "p3", name: "Pump 3" },
];

let current: Table<(typeof PUMPS)[number]> | null = null;
const capture = (t: Table<(typeof PUMPS)[number]>) => {
  current = t;
};
function Pumps({ grid = true, selectable = true }: { grid?: boolean; selectable?: boolean }) {
  const t = useTable(PUMPS, { rowKey: (p) => p.id });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame grid={grid} selectable={selectable} aria-label="Pumps">
      <Column value="name" label="Pump" rowHeader />
    </Frame>
  );
}

const region = () => document.querySelector("[data-umriss-announcer]");
const voice = async () => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(150);
  });
  return region()?.textContent ?? "";
};
const rows = () => screen.getAllByRole("row").slice(1);
const states = () => rows().map((r) => r.getAttribute("aria-selected"));
const grid = () => screen.getByRole("grid");

beforeEach(() => {
  vi.useFakeTimers();
  region()?.replaceChildren();
});
afterEach(() => vi.useRealTimers());

describe("Selection in grid mode", () => {
  it("marks the grid and every row, after a click, Space and select all", async () => {
    render(<Pumps />);
    expect(grid().getAttribute("aria-multiselectable")).toBe("true");
    expect(states()).toEqual(["false", "false", "false"]);

    fireEvent.click(screen.getByRole("checkbox", { name: "Select Pump 2" }));
    expect(states()).toEqual(["false", "true", "false"]);
    expect(await voice()).toBe("1 selected");

    const cell = screen.getByText("Pump 3").closest("td, th")!;
    fireEvent.keyDown(cell, { key: " " });
    expect(states()).toEqual(["false", "true", "true"]);
    expect(await voice()).toBe("2 selected");

    fireEvent.click(screen.getByRole("checkbox", { name: "Select all" }));
    expect(states()).toEqual(["true", "true", "true"]);
    expect(await voice()).toBe("3 selected");
  });

  it("says nothing for a change from outside", async () => {
    render(<Pumps />);
    act(() => current!.selection.toggle("p1"));
    expect(states()).toEqual(["true", "false", "false"]);
    expect(await voice()).toBe("");
  });

  it("speaks German", async () => {
    render(
      <LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>
        <Pumps />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Pump 1 auswählen" }));
    expect(await voice()).toBe("1 ausgewählt");
  });

  it("carries nothing without selectable", () => {
    render(<Pumps selectable={false} />);
    expect(grid().hasAttribute("aria-multiselectable")).toBe(false);
    expect(states()).toEqual([null, null, null]);
  });

  it("leaves a native table's rows without aria-selected", () => {
    render(<Pumps grid={false} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Pump 2" }));
    expect(states()).toEqual([null, null, null]);
  });
});
