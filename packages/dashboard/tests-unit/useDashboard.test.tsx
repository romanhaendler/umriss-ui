import { useEffect } from "react";
import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { useDashboard } from "../src";
import type { DashboardView } from "../src";

const DEFAULT: DashboardView = {
  widgets: [
    { id: "a", type: "figure", size: "small", options: { name: "Orders" } },
    { id: "b", type: "figure", size: "wide", options: { name: "Backlog" } },
    { id: "c", type: "note", size: "full", options: {} },
  ],
};

const hand: { setView: (view: DashboardView) => void; view: DashboardView } = { setView: () => undefined, view: DEFAULT };

function Harness({ initialView }: { initialView?: DashboardView }) {
  const { Dashboard, WidgetType, view, setView } = useDashboard({ defaultView: DEFAULT, initialView });
  useEffect(() => {
    hand.setView = setView;
    hand.view = view;
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
      <WidgetType name="note" label="Note" sentence="A line." sizes={{ full: { columns: 12, rows: 1 } }} start="full" defaultOptions={{}}>
        {({ size }) => <span>{`note at ${size}`}</span>}
      </WidgetType>
    </Dashboard>
  );
}

const frames = () => screen.getAllByRole("region").map((el) => el.getAttribute("data-widget"));

describe("useDashboard", () => {
  it("shows the default view's widgets in the stored order, each told its size", () => {
    render(<Harness />);
    expect(frames()).toEqual(["a", "b", "c"]);
    expect(screen.getByText("Orders at small")).toBeTruthy();
    expect(screen.getByText("Backlog at wide")).toBeTruthy();
    expect(screen.getByText("note at full")).toBeTruthy();
  });

  it("puts each widget on the lines the packing gives", () => {
    render(<Harness />);
    const style = (id: string) => screen.getAllByRole("region").find((el) => el.getAttribute("data-widget") === id)!.getAttribute("style");
    expect(style("a")).toContain("--column: 1");
    expect(style("b")).toContain("--column: 4");
    expect(style("c")).toContain("--column: 1");
    expect(style("c")).toContain("--row: 3");
    expect(style("c")).toContain("--columns: 12");
  });

  it("titles each frame", () => {
    render(<Harness />);
    expect(screen.getByRole("region", { name: "Backlog" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Note" })).toBeTruthy();
  });

  it("shows the reader's own view instead of the default", () => {
    render(<Harness initialView={{ widgets: [DEFAULT.widgets[2]!, DEFAULT.widgets[0]!] }} />);
    expect(frames()).toEqual(["c", "a"]);
  });

  it("reads initialView once", () => {
    const { rerender } = render(<Harness initialView={{ widgets: [DEFAULT.widgets[2]!] }} />);
    rerender(<Harness initialView={{ widgets: [DEFAULT.widgets[0]!] }} />);
    expect(frames()).toEqual(["c"]);
  });

  it("setView shows a whole other arrangement", () => {
    render(<Harness />);
    act(() => hand.setView({ widgets: [{ id: "b", type: "figure", size: "small", options: { name: "Backlog" } }] }));
    expect(frames()).toEqual(["b"]);
    expect(screen.getByText("Backlog at small")).toBeTruthy();
    expect(hand.view.widgets.map((w) => w.id)).toEqual(["b"]);
  });
});
