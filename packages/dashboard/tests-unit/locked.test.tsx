import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@umriss-ui/core";
import { GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { HeadingType, useDashboard } from "../src";
import type { DashboardView } from "../src";
import { move, remove, resize, setOptions } from "../src/edit";

const widget = (id: string, name: string, locked?: unknown) => ({ id, type: "figure", size: "small" as const, options: { name }, ...(locked === undefined ? {} : { locked }) });
const LOCKED = { widgets: [widget("a", "Orders"), widget("b", "Safety", true), widget("c", "Late")] } as DashboardView;

type Hand = { reset: () => void; setView: (view: DashboardView) => void };
const hand = {} as Hand;

function Harness({ defaultView = LOCKED, initialView, onViewChange }: { defaultView?: DashboardView; initialView?: DashboardView; onViewChange?: (v: DashboardView) => void }) {
  const { Dashboard, WidgetType, reset, setView } = useDashboard({ defaultView, initialView, onViewChange });
  useEffect(() => {
    Object.assign(hand, { reset, setView });
  });
  return (
    <Dashboard aria-label="Start">
      <WidgetType name="figure" label="Figure" sentence="One number." sizes={{ small: { columns: 3, rows: 2 }, wide: { columns: 6, rows: 2 } }} start="small" defaultOptions={{ name: "Orders" }} title={(options) => options.name}>
        {({ size, options }) => <span>{`${options.name} at ${size}`}</span>}
      </WidgetType>
    </Dashboard>
  );
}

const order = () => screen.getAllByRole("region").map((el) => el.getAttribute("data-widget"));
const press = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
const menuOf = (title: string) => fireEvent.click(screen.getByRole("button", { name: `Actions for ${title}` }));
const item = (name: string | RegExp) => fireEvent.click(screen.getByRole("menuitem", { name }));
const items = () => screen.getAllByRole("menuitem").map((el) => el.textContent);

function HeadingOnly() {
  const { Dashboard } = useDashboard({ defaultView: { widgets: [{ id: "h", type: "heading", size: "full", options: { text: "Top" }, locked: true }] } as DashboardView });
  return (
    <Dashboard aria-label="Start">
      <HeadingType />
    </Dashboard>
  );
}

describe("a locked heading widget", () => {
  it("shows the word for locked in the mode and none outside", () => {
    render(<HeadingOnly />);
    expect(screen.queryByText("Locked")).toBeNull();
    press("Edit");
    expect(screen.getAllByText("Locked")).toHaveLength(1);
    press("Done");
    expect(screen.queryByText("Locked")).toBeNull();
  });
});

describe("a locked widget", () => {
  it("has the moves and a disabled line saying why, and no size, options or Remove", () => {
    render(<Harness />);
    press("Edit");
    menuOf("Safety");
    expect(items()).toEqual(["Place 2 of 3", "Move to start", "Move earlier", "Move later", "Move to end", "Locked: keeps its size and options"]);
    expect((screen.getByRole("menuitem", { name: /^Locked/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("is named locked on its head in the mode and shows the word beside the size", () => {
    render(<Harness />);
    expect(screen.queryByText("Locked")).toBeNull();
    press("Edit");
    expect(screen.getByRole("group", { name: "Safety, place 2 of 3, locked" })).toBeTruthy();
    expect(screen.getAllByText("Locked")).toHaveLength(1);
    expect(screen.getByRole("group", { name: "Orders, place 1 of 3" })).toBeTruthy();
    press("Done");
    expect(screen.queryByText("Locked")).toBeNull();
    expect(screen.queryByRole("group", { name: /locked/ })).toBeNull();
  });

  it("moves by the menu and the arrow keys, and Done reports it moved and still locked", () => {
    const onViewChange = vi.fn();
    render(<Harness onViewChange={onViewChange} />);
    press("Edit");
    menuOf("Safety");
    item("Move to end");
    expect(order()).toEqual(["a", "c", "b"]);
    fireEvent.keyDown(screen.getByRole("group", { name: "Safety, place 3 of 3, locked" }), { key: "Home" });
    expect(order()).toEqual(["b", "a", "c"]);
    fireEvent.keyDown(screen.getByRole("group", { name: "Safety, place 1 of 3, locked" }), { key: "ArrowRight" });
    expect(order()).toEqual(["a", "b", "c"]);
    fireEvent.keyDown(screen.getByRole("group", { name: "Safety, place 2 of 3, locked" }), { key: "End" });
    press("Done");
    expect(onViewChange.mock.calls[0]![0].widgets.map((w: { id: string; locked?: boolean }) => `${w.id}:${w.locked ?? false}`)).toEqual(["a:false", "c:false", "b:true"]);
  });

  it("shifts when another widget is moved before it", () => {
    render(<Harness />);
    press("Edit");
    menuOf("Late");
    item("Move to start");
    expect(order()).toEqual(["c", "a", "b"]);
  });

  it("is not changed by removing, resizing or setting options, which leave no step", () => {
    for (const edit of [remove("b"), resize("b", "wide"), setOptions("b", { name: "Other" })]) expect(edit(LOCKED)).toBe(LOCKED);
    expect(remove("a")(LOCKED)).not.toBe(LOCKED);
    expect(resize("a", "wide")(LOCKED)).not.toBe(LOCKED);
    expect(setOptions("a", {})(LOCKED)).not.toBe(LOCKED);
    expect(move("b", 0)(LOCKED).widgets[0]!.id).toBe("b");
  });

  it("is set by Reset and setView with its locks, or without", () => {
    const plain = { widgets: [widget("a", "Orders"), widget("b", "Safety")] } as DashboardView;
    render(<Harness initialView={plain} />);
    press("Edit");
    act(() => hand.reset());
    expect(screen.getByRole("group", { name: "Safety, place 2 of 3, locked" })).toBeTruthy();
    act(() => hand.setView(plain));
    expect(screen.queryByRole("group", { name: /locked/ })).toBeNull();
    act(() => hand.setView(LOCKED));
    expect(screen.getByRole("group", { name: "Safety, place 2 of 3, locked" })).toBeTruthy();
  });

  it("is locked by true only", () => {
    render(<Harness defaultView={{ widgets: [widget("a", "Orders", "yes"), widget("b", "Safety", 1)] } as DashboardView} />);
    press("Edit");
    expect(screen.queryByRole("group", { name: /locked/ })).toBeNull();
    menuOf("Orders");
    expect(items()).toContain("Remove");
  });

  it("is worded in German", () => {
    render(
      <LanguageProvider wording={GERMAN_WORDING}>
        <Harness />
      </LanguageProvider>,
    );
    press("Bearbeiten");
    expect(screen.getByRole("group", { name: "Safety, Platz 2 von 3, gesperrt" })).toBeTruthy();
    expect(screen.getByText("Gesperrt")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Aktionen für Safety" }));
    expect(items().at(-1)).toBe("Gesperrt: behält Größe und Optionen");
  });
});
