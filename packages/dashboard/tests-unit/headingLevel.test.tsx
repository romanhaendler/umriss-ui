import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { HeadingType, useDashboard } from "../src";
import type { DashboardView } from "../src";

const FIGURES: DashboardView = {
  widgets: [
    { id: "a", type: "figure", size: "small", options: { name: "Orders" } },
    { id: "b", type: "figure", size: "small", options: { name: "Late" } },
  ],
};

const WITH_HEADING: DashboardView = { widgets: [{ id: "h", type: "heading", size: "full", options: { text: "Top" } }, ...FIGURES.widgets] };

function Harness({ defaultView, headingLevel }: { defaultView: DashboardView; headingLevel?: 2 | 3 | 4 | 5 | 6 }) {
  const { Dashboard, WidgetType } = useDashboard({ defaultView });
  return (
    <Dashboard aria-label="Start" headingLevel={headingLevel}>
      <HeadingType />
      <WidgetType name="figure" label="Figure" sentence="One number." sizes={{ small: { columns: 3, rows: 2 } }} start="small" defaultOptions={{ name: "Orders" }} title={(o) => o.name}>
        {({ options }) => <span>{`${options.name}`}</span>}
      </WidgetType>
    </Dashboard>
  );
}

describe("the heading level of a dashboard", () => {
  it("draws the titles at the default level 2 without heading widgets, and at 3 when asked", () => {
    const { unmount } = render(<Harness defaultView={FIGURES} />);
    expect(screen.getByRole("heading", { level: 2, name: "Orders" })).toBeTruthy();
    unmount();
    render(<Harness defaultView={FIGURES} headingLevel={3} />);
    expect(screen.getByRole("heading", { level: 3, name: "Orders" })).toBeTruthy();
    expect(screen.queryByRole("heading", { level: 2, name: "Orders" })).toBeNull();
  });

  it("draws the heading widget at the level and the titles one below it, with heading widgets", () => {
    render(<Harness defaultView={WITH_HEADING} />);
    expect(screen.getByRole("heading", { level: 2, name: "Top" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 3, name: "Orders" })).toBeTruthy();
  });

  it("draws the heading widget at 3 and the titles at 4, with heading widgets", () => {
    render(<Harness defaultView={WITH_HEADING} headingLevel={3} />);
    expect(screen.getByRole("heading", { level: 3, name: "Top" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 4, name: "Orders" })).toBeTruthy();
  });

  it("draws the titles at 6 when the heading widget is at 6, one below 6 being 6", () => {
    render(<Harness defaultView={WITH_HEADING} headingLevel={6} />);
    expect(screen.getByRole("heading", { level: 6, name: "Top" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 6, name: "Orders" })).toBeTruthy();
  });

  it("moves the titles one level down when the first heading widget is added in a draft, and back on undo", () => {
    render(<Harness defaultView={FIGURES} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("heading", { level: 2, name: "Orders" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Add widget" }));
    fireEvent.click(screen.getByRole("button", { name: "Add Heading" }));
    expect(screen.getByRole("heading", { level: 3, name: "Orders" })).toBeTruthy();
    expect(screen.queryByRole("heading", { level: 2, name: "Orders" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByRole("heading", { level: 2, name: "Orders" })).toBeTruthy();
  });
});
