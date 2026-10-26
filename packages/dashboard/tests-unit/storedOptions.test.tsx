import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useDashboard } from "../src";
import type { DashboardView } from "../src";

const DEFAULT: DashboardView = { widgets: [] };
const figure = { id: "m", type: "figure", size: "small" as const, options: { name: "Figure m" } };
const card = (options: unknown, type = "card") => ({ id: "k", type, size: "small" as const, options });

function run(widget: unknown) {
  const onViewChange = vi.fn();
  let seen: DashboardView = DEFAULT;
  function Harness() {
    const { Dashboard, WidgetType, view } = useDashboard({ defaultView: DEFAULT, initialView: { widgets: [widget as never, figure] }, onViewChange });
    seen = view;
    return (
      <Dashboard aria-label="Start">
        <WidgetType name="card" label="Card" sentence="One." sizes={{ small: { columns: 3, rows: 2 } }} start="small" defaultOptions={{ a: "A", b: "B" }}>
          {({ options }) => <span>{`card ${JSON.stringify(options)}`}</span>}
        </WidgetType>
        <WidgetType name="figure" label="Figure" sentence="One." sizes={{ small: { columns: 3, rows: 2 } }} start="small" defaultOptions={{ name: "New" }}>
          {() => <span>figure</span>}
        </WidgetType>
      </Dashboard>
    );
  }
  render(<Harness />);
  return { onViewChange, view: () => seen };
}

describe("stored options read over the type's defaults", () => {
  it.each([
    ["a key missing", { a: "mine" }, { a: "mine", b: "B" }],
    ["no options", undefined, { a: "A", b: "B" }],
    ["options that are a string", "text", { a: "A", b: "B" }],
  ])("fills %s from the defaults", (_, stored, merged) => {
    const { onViewChange, view } = run(card(stored));
    expect(screen.getByText(`card ${JSON.stringify(merged)}`)).toBeTruthy();
    expect(view().widgets[0]!.options).toEqual(merged);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Actions for Card" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Move later" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onViewChange).toHaveBeenCalledTimes(1);
    expect(onViewChange.mock.calls[0]![0].widgets.map((w: { options: unknown }) => w.options)).toEqual([figure.options, merged]);
  });

  it("reports nothing for Edit then Done without a change", () => {
    const { onViewChange } = run(card({ a: "mine" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onViewChange).not.toHaveBeenCalled();
  });

  it("leaves the options of a type not declared as stored", () => {
    const ghost = card("raw", "ghost");
    const { onViewChange, view } = run(ghost);
    expect(view().widgets.map((w) => w.id)).toEqual(["m"]);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Actions for Figure" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Remove" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onViewChange).toHaveBeenCalledWith({ widgets: [ghost] });
  });
});
