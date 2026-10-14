import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useDashboard } from "../src";
import type { DashboardView } from "../src";

const DEFAULT: DashboardView = {
  widgets: [
    { id: "a", type: "figure", size: "small", options: { name: "Orders" } },
    { id: "b", type: "figure", size: "wide", options: { name: "Backlog" } },
    { id: "c", type: "figure", size: "small", options: { name: "Late" } },
  ],
};

type Hand = { undo: () => void; redo: () => void; reset: () => void };
const hand = {} as Hand;

function Harness({ onViewChange, initialView }: { onViewChange?: (v: DashboardView) => void; initialView?: DashboardView }) {
  const { Dashboard, WidgetType, undo, redo, reset } = useDashboard({ defaultView: DEFAULT, initialView, onViewChange });
  useEffect(() => {
    Object.assign(hand, { undo, redo, reset });
  });
  return (
    <Dashboard aria-label="Start">
      <WidgetType
        name="figure"
        label="Figure"
        sentence="One number."
        sizes={{ small: { columns: 3, rows: 2 }, wide: { columns: 6, rows: 2 } }}
        start="small"
        defaultOptions={{ name: "Orders" }}
        title={(options) => options.name}
      >
        {({ size, options }) => <span>{`${options.name} at ${size}`}</span>}
      </WidgetType>
    </Dashboard>
  );
}

const order = () => screen.getAllByRole("region").map((el) => el.getAttribute("data-widget"));
const press = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
const button = (name: string) => screen.getByRole("button", { name }) as HTMLButtonElement;
const menuOf = (title: string) => fireEvent.click(screen.getByRole("button", { name: `Actions for ${title}` }));
const item = (name: string | RegExp) => fireEvent.click(screen.getByRole("menuitem", { name }));
const said = (text: string) => waitFor(() => expect(document.querySelector("[data-umriss-announcer]")?.textContent).toBe(text));
const moveToEnd = (title: string) => {
  menuOf(title);
  item("Move to end");
};

describe("undo, redo and reset", () => {
  it("shows the three buttons in the mode, disabled where there is nothing to do", () => {
    render(<Harness />);
    expect(screen.queryByRole("button", { name: "Undo" })).toBeNull();
    press("Edit");
    expect(button("Undo").disabled).toBe(true);
    expect(button("Redo").disabled).toBe(true);
    expect(button("Reset").disabled).toBe(true);
    moveToEnd("Orders");
    expect(button("Undo").disabled).toBe(false);
    expect(button("Redo").disabled).toBe(true);
    expect(button("Reset").disabled).toBe(false);
  });

  it("undoes and redoes moves, sizes and removals, one step each, and says so", async () => {
    render(<Harness />);
    press("Edit");
    moveToEnd("Orders");
    menuOf("Late");
    item(/Wide/);
    menuOf("Backlog");
    item("Remove");
    expect(order()).toEqual(["c", "a"]);
    press("Undo");
    expect(order()).toEqual(["b", "c", "a"]);
    await said("Undone");
    press("Undo");
    expect(screen.getByText("Late at small")).toBeTruthy();
    press("Undo");
    expect(order()).toEqual(["a", "b", "c"]);
    expect(button("Undo").disabled).toBe(true);
    press("Redo");
    expect(order()).toEqual(["b", "c", "a"]);
    await said("Redone");
    press("Redo");
    expect(screen.getByText("Late at wide")).toBeTruthy();
    press("Redo");
    expect(order()).toEqual(["c", "a"]);
    expect(button("Redo").disabled).toBe(true);
  });

  it("forgets the steps ahead on a new step after an undo", () => {
    render(<Harness />);
    press("Edit");
    moveToEnd("Orders");
    press("Undo");
    moveToEnd("Backlog");
    expect(order()).toEqual(["a", "c", "b"]);
    expect(button("Redo").disabled).toBe(true);
  });

  it("resets in one step to the default and takes it back with Undo", async () => {
    render(<Harness initialView={{ widgets: [DEFAULT.widgets[2]!] }} />);
    press("Edit");
    expect(button("Reset").disabled).toBe(false);
    press("Reset");
    expect(order()).toEqual(["a", "b", "c"]);
    expect(button("Reset").disabled).toBe(true);
    await said("Reset to the default");
    press("Undo");
    expect(order()).toEqual(["c"]);
    expect(button("Undo").disabled).toBe(true);
  });

  it("reports the undone state on Done", () => {
    const onViewChange = vi.fn();
    render(<Harness onViewChange={onViewChange} />);
    press("Edit");
    moveToEnd("Orders");
    moveToEnd("Backlog");
    press("Undo");
    press("Done");
    expect(onViewChange).toHaveBeenCalledTimes(1);
    expect(onViewChange.mock.calls[0]![0].widgets.map((w: { id: string }) => w.id)).toEqual(["b", "c", "a"]);
  });

  it("reports nothing on Done when everything was undone", () => {
    const onViewChange = vi.fn();
    render(<Harness onViewChange={onViewChange} />);
    press("Edit");
    moveToEnd("Orders");
    press("Undo");
    press("Done");
    expect(onViewChange).not.toHaveBeenCalled();
  });

  it("restores the arrangement from before Edit on Cancel, after several undos", () => {
    render(<Harness />);
    press("Edit");
    moveToEnd("Orders");
    moveToEnd("Backlog");
    moveToEnd("Late");
    press("Undo");
    press("Undo");
    press("Cancel");
    expect(order()).toEqual(["a", "b", "c"]);
    press("Edit");
    expect(button("Undo").disabled).toBe(true);
  });

  it("hands undo, redo and reset to the application", () => {
    render(<Harness />);
    press("Edit");
    moveToEnd("Orders");
    act(() => hand.undo());
    expect(order()).toEqual(["a", "b", "c"]);
    act(() => hand.redo());
    expect(order()).toEqual(["b", "c", "a"]);
    act(() => hand.reset());
    expect(order()).toEqual(["a", "b", "c"]);
  });
});
