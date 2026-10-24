import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useDashboard } from "../src";
import type { DashboardView } from "../src";

const DEFAULT: DashboardView = { widgets: [{ id: "x", type: "figure", size: "small", options: { name: "X" } }] };
const figure = (id: string) => ({ id, type: "figure", size: "small" as const, options: { name: `Figure ${id}` } });
const ghost = (id: string) => ({ id, type: "ghost", size: "small", options: { keep: id } });

function Harness({ initialView, onViewChange }: { initialView?: unknown; onViewChange?: (v: DashboardView) => void }) {
  const { Dashboard, WidgetType, setView, reset } = useDashboard({ defaultView: DEFAULT, initialView: initialView as DashboardView, onViewChange });
  return (
    <>
      <button onClick={() => setView(initialView as DashboardView)}>again</button>
      <button onClick={reset}>reset!</button>
      <Dashboard aria-label="Start">
        <WidgetType
          name="figure"
          label="Figure"
          sentence="One."
          sizes={{ small: { columns: 3, rows: 2 }, wide: { columns: 6, rows: 2 } }}
          start="small"
          defaultOptions={{ name: "New" }}
          title={(options) => options.name}
        >
          {() => <span>figure</span>}
        </WidgetType>
      </Dashboard>
    </>
  );
}

const order = () => screen.getAllByRole("region").map((el) => el.getAttribute("data-widget"));

describe("a stored view that is not a view", () => {
  it.each([{}, { widgets: null }, { widgets: "x" }, [], 5, null, { version: 1, items: [] }])("reads %j as the default view", (stored) => {
    render(<Harness initialView={stored} />);
    expect(order()).toEqual(["x"]);
    fireEvent.click(screen.getByText("again"));
    expect(order()).toEqual(["x"]);
  });

  it("drops an entry without a string id or type and keeps the others", () => {
    render(<Harness initialView={{ widgets: [null, 5, { type: "figure" }, { id: 1, type: "figure" }, { id: "k" }, figure("a")] }} />);
    expect(order()).toEqual(["a"]);
  });
});

describe("widgets of a type not declared now", () => {
  const stored = { widgets: [ghost("g1"), figure("a"), figure("b"), ghost("g2")] };

  it("stay in the stored view after a removal and Done", () => {
    const onViewChange = vi.fn();
    render(<Harness initialView={stored} onViewChange={onViewChange} />);
    expect(order()).toEqual(["a", "b"]);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Actions for Figure a" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Remove" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onViewChange).toHaveBeenCalledWith({ widgets: [figure("b"), ghost("g1"), ghost("g2")] });
    expect(order()).toEqual(["b"]);
  });

  it("follow the edited arrangement when Reset is followed by Done", () => {
    const onViewChange = vi.fn();
    render(<Harness initialView={stored} onViewChange={onViewChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByText("reset!"));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onViewChange).toHaveBeenCalledWith({ widgets: [{ ...figure("x"), options: { name: "X" } }, ghost("g1"), ghost("g2")] });
  });

  it("are not written by Cancel", () => {
    const onViewChange = vi.fn();
    render(<Harness initialView={stored} onViewChange={onViewChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onViewChange).not.toHaveBeenCalled();
  });
});

describe("editing through the hook before any widget type is declared", () => {
  function Bare({ onViewChange }: { onViewChange: (v: DashboardView) => void }) {
    const { edit, reset, done } = useDashboard({ defaultView: DEFAULT, initialView: { widgets: [figure("x"), figure("a")] }, onViewChange });
    return (
      <>
        <button onClick={edit}>edit</button>
        <button onClick={reset}>reset</button>
        <button onClick={done}>done</button>
      </>
    );
  }

  it("writes each widget once on Done", () => {
    const onViewChange = vi.fn();
    render(<Bare onViewChange={onViewChange} />);
    for (const name of ["edit", "reset", "done"]) fireEvent.click(screen.getByText(name));
    expect(onViewChange).toHaveBeenCalledWith(DEFAULT);
  });
});
