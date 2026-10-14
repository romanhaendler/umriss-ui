import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useDashboard } from "../src";
import type { DashboardView } from "../src";

const DEFAULT: DashboardView = {
  widgets: [
    { id: "a", type: "figure", size: "small", options: { name: "Orders" } },
    { id: "b", type: "figure", size: "wide", options: { name: "Backlog" } },
    { id: "c", type: "figure", size: "small", options: { name: "Late" } },
  ],
};

type Hand = { edit: () => void; done: () => void; cancel: () => void; editing: boolean; view: DashboardView };
const hand = {} as Hand;

function Harness({ allowEdit, onViewChange, onDraftChange }: { allowEdit?: boolean; onViewChange?: (v: DashboardView) => void; onDraftChange?: (open: boolean) => void }) {
  const { Dashboard, WidgetType, view, editing, edit, done, cancel } = useDashboard({ defaultView: DEFAULT, allowEdit, onViewChange, onDraftChange });
  useEffect(() => {
    Object.assign(hand, { edit, done, cancel, editing, view });
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
const menuOf = (title: string) => fireEvent.click(screen.getByRole("button", { name: `Actions for ${title}` }));
const item = (name: string | RegExp) => fireEvent.click(screen.getByRole("menuitem", { name }));
const said = (text: string) => waitFor(() => expect(document.querySelector("[data-umriss-announcer]")?.textContent).toBe(text));

describe("the editing mode", () => {
  it("is entered by Edit, shown by a label and a changed frame, and leaves the bodies inert", () => {
    render(<Harness />);
    expect(screen.queryByRole("button", { name: "Actions for Orders" })).toBeNull();
    press("Edit");
    expect(screen.getByText("Editing the dashboard")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
    const frame = screen.getByRole("region", { name: "Orders" });
    expect(frame.hasAttribute("data-editing")).toBe(true);
    expect(frame.querySelector("[inert]")).toBeTruthy();
  });

  it("draws no bar and cannot be entered when editing is not allowed", () => {
    render(<Harness allowEdit={false} />);
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
    act(() => hand.edit());
    expect(hand.editing).toBe(false);
    expect(screen.queryByRole("button", { name: "Actions for Orders" })).toBeNull();
  });

  it("tells the application when a draft opens and closes", () => {
    const onDraftChange = vi.fn();
    render(<Harness onDraftChange={onDraftChange} />);
    press("Edit");
    expect(onDraftChange).toHaveBeenLastCalledWith(true);
    press("Cancel");
    expect(onDraftChange).toHaveBeenLastCalledWith(false);
    expect(onDraftChange).toHaveBeenCalledTimes(2);
  });

  it("offers the menu with place, moves, sizes and remove; the meaningless ones disabled", () => {
    render(<Harness />);
    press("Edit");
    menuOf("Orders");
    expect(screen.getByText("Place 1 of 3")).toBeTruthy();
    expect((screen.getByRole("menuitem", { name: "Move to start" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("menuitem", { name: "Move earlier" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("menuitem", { name: "Move later" }) as HTMLButtonElement).disabled).toBe(false);
    const sizes = screen.getAllByRole("menuitem").map((el) => el.textContent ?? "").filter((t) => /wide/i.test(t));
    expect(sizes).toEqual(["✓ Small, 1/4 wide", "Wide, 1/2 wide"]);
    expect(screen.getByRole("menuitem", { name: /Small/ }).getAttribute("aria-current")).toBe("true");
  });

  it("moves a widget by the menu, announces it and returns the focus to the menu button", async () => {
    render(<Harness />);
    press("Edit");
    menuOf("Orders");
    item("Move to end");
    expect(order()).toEqual(["b", "c", "a"]);
    await said("Orders: moved from place 1 to place 3 of 3");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Actions for Orders" }));
    menuOf("Orders");
    item("Move earlier");
    expect(order()).toEqual(["b", "a", "c"]);
    menuOf("Orders");
    item("Move to start");
    expect(order()).toEqual(["a", "b", "c"]);
    menuOf("Backlog");
    item("Move later");
    expect(order()).toEqual(["a", "c", "b"]);
  });

  it("chooses a size by name and announces it", async () => {
    render(<Harness />);
    press("Edit");
    menuOf("Orders");
    item(/Wide/);
    expect(screen.getByText("Orders at wide")).toBeTruthy();
    await said("Orders: size Wide");
  });

  it("removes without a question and announces it", async () => {
    render(<Harness />);
    press("Edit");
    menuOf("Backlog");
    item("Remove");
    expect(order()).toEqual(["a", "c"]);
    await said("Backlog removed");
  });

  it("moves a focused head with the arrow keys, Home and End", async () => {
    render(<Harness />);
    press("Edit");
    const head = () => screen.getByRole("group", { name: /^Orders, place/ });
    expect(head().getAttribute("tabindex")).toBe("0");
    expect(head().getAttribute("aria-label")).toBe("Orders, place 1 of 3");
    fireEvent.keyDown(head(), { key: "ArrowRight" });
    expect(order()).toEqual(["b", "a", "c"]);
    fireEvent.keyDown(head(), { key: "ArrowDown" });
    expect(order()).toEqual(["b", "c", "a"]);
    await said("Orders: moved from place 2 to place 3 of 3");
    fireEvent.keyDown(head(), { key: "ArrowLeft" });
    expect(order()).toEqual(["b", "a", "c"]);
    fireEvent.keyDown(head(), { key: "End" });
    expect(order()).toEqual(["b", "c", "a"]);
    fireEvent.keyDown(head(), { key: "ArrowUp" });
    fireEvent.keyDown(head(), { key: "Home" });
    expect(order()).toEqual(["a", "b", "c"]);
  });

  it("reports the whole view once on Done, and not at all when nothing changed", async () => {
    const onViewChange = vi.fn();
    render(<Harness onViewChange={onViewChange} />);
    press("Edit");
    menuOf("Orders");
    item("Move to end");
    menuOf("Late");
    item(/Wide/);
    expect(onViewChange).not.toHaveBeenCalled();
    press("Done");
    expect(onViewChange).toHaveBeenCalledTimes(1);
    expect(onViewChange.mock.calls[0]![0].widgets.map((w: { id: string; size: string }) => `${w.id}:${w.size}`)).toEqual(["b:wide", "c:wide", "a:small"]);
    expect(screen.getByRole("button", { name: "Edit" })).toBeTruthy();
    await said("Changes kept");

    press("Edit");
    press("Done");
    expect(onViewChange).toHaveBeenCalledTimes(1);
  });

  it("puts everything back on Cancel without reporting", async () => {
    const onViewChange = vi.fn();
    render(<Harness onViewChange={onViewChange} />);
    press("Edit");
    menuOf("Orders");
    item("Remove");
    press("Cancel");
    expect(order()).toEqual(["a", "b", "c"]);
    expect(onViewChange).not.toHaveBeenCalled();
    await said("Changes discarded");
  });

  it("cannot change anything outside the mode", () => {
    render(<Harness />);
    expect(within(screen.getByRole("region", { name: "Orders" })).queryByRole("group")).toBeNull();
    fireEvent.keyDown(screen.getByRole("region", { name: "Orders" }), { key: "End" });
    expect(order()).toEqual(["a", "b", "c"]);
  });
});
