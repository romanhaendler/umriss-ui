import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { useDashboard } from "../src";

const hand: { edit: () => void; open: () => void; old: () => void } = { edit: () => undefined, open: () => undefined, old: () => undefined };

function Harness() {
  const { Dashboard, WidgetType, edit, openCatalogue, catalogue } = useDashboard({ defaultView: { widgets: [] } });
  useEffect(() => {
    hand.edit = edit;
    hand.open = openCatalogue;
    hand.old = catalogue;
  });
  return (
    <Dashboard aria-label="Start">
      <WidgetType name="note" label="Note" sentence="A line of text." sizes={{ full: { columns: 12, rows: 1 } }} start="full" defaultOptions={{}}>
        {() => <span>note</span>}
      </WidgetType>
    </Dashboard>
  );
}

const opened = () => screen.queryByText("A line of text.") !== null;

describe("openCatalogue", () => {
  it("opens the catalogue in the editing mode", () => {
    render(<Harness />);
    act(() => hand.edit());
    act(() => hand.open());
    expect(opened()).toBe(true);
  });

  it("is kept under its old name, which opens it and warns once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<Harness />);
    act(() => hand.edit());
    act(() => hand.old());
    act(() => hand.old());
    expect(opened()).toBe(true);
    expect(warn.mock.calls.filter(([m]) => String(m).includes("openCatalogue"))).toHaveLength(1);
    warn.mockRestore();
  });
});
