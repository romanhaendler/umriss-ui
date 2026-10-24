import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useDashboard } from "../src";
import type { DashboardView } from "../src";

const KEPT: DashboardView = {
  widgets: [
    { id: "a", type: "gone", size: "small", options: {} },
    { id: "b", type: "figure", size: "large", options: { name: "Backlog" } },
    { id: "b", type: "figure", size: "small", options: { name: "Twin" } },
    { id: "c", type: "broken", size: "small", options: {} },
    { id: "d", type: "figure", size: "wide", options: { name: "Late" } },
  ],
};

function Harness({ onViewChange }: { onViewChange?: (v: DashboardView) => void }) {
  const { Dashboard, WidgetType } = useDashboard({ defaultView: { widgets: [] }, initialView: KEPT, onViewChange });
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
      <WidgetType name="broken" label="Broken" sentence="Throws." sizes={{ small: { columns: 3, rows: 2 } }} start="small" defaultOptions={{}}>
        {() => {
          throw new Error("no");
        }}
      </WidgetType>
    </Dashboard>
  );
}

const order = () => screen.getAllByRole("region").map((el) => el.getAttribute("data-widget"));

describe("a kept view read leniently", () => {
  it("drops unknown types and repeated ids, and starts a retired size at the type's start", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(<Harness />);
    expect(order()).toEqual(["b", "c", "d"]);
    expect(screen.getByText("Backlog at small")).toBeTruthy();
    expect(screen.getByText("Late at wide")).toBeTruthy();
  });

  it("shows a failed widget in its frame, still removable, and counts only what is shown", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const onViewChange = vi.fn();
    render(<Harness onViewChange={onViewChange} />);
    const frame = screen.getByRole("region", { name: "Broken" });
    expect(frame.textContent).toContain("This widget cannot show anything.");
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Actions for Broken" }));
    expect(screen.getByRole("menuitem", { name: "Place 2 of 3" })).toBeTruthy();
    fireEvent.click(screen.getByRole("menuitem", { name: "Remove" }));
    expect(order()).toEqual(["b", "d"]);
    expect(screen.getByText("Late at wide")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onViewChange).toHaveBeenCalledWith({
      widgets: [
        { id: "b", type: "figure", size: "small", options: { name: "Backlog" } },
        { id: "d", type: "figure", size: "wide", options: { name: "Late" } },
        { id: "a", type: "gone", size: "small", options: {} },
      ],
    });
  });
});
