import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@umriss-ui/core";
import { GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { HeadingType, useDashboard } from "../src";
import type { DashboardView } from "../src";

function Harness({ view }: { view: DashboardView }) {
  const { Dashboard, WidgetType } = useDashboard({ defaultView: view });
  return (
    <Dashboard aria-label="Start">
      <HeadingType />
      <WidgetType name="note" label="Note" sentence="A line." sizes={{ small: { columns: 3, rows: 2 } }} start="small" defaultOptions={{}}>
        {() => <span>a note</span>}
      </WidgetType>
    </Dashboard>
  );
}

describe("a dashboard at every width", () => {
  it("says that it is empty, in English and in German", () => {
    const { unmount } = render(<Harness view={{ widgets: [] }} />);
    expect(screen.getByText("This dashboard is empty.")).toBeTruthy();
    unmount();
    render(
      <LanguageProvider wording={GERMAN_WORDING}>
        <Harness view={{ widgets: [] }} />
      </LanguageProvider>,
    );
    expect(screen.getByText("Dieses Dashboard ist leer.")).toBeTruthy();
  });

  it("draws a heading widget as a title across the full width, without a card", () => {
    render(<Harness view={{ widgets: [{ id: "h", type: "heading", size: "full", options: { text: "Deliveries" } }, { id: "n", type: "note", size: "small", options: {} }] }} />);
    expect(screen.getByRole("heading", { name: "Deliveries" })).toBeTruthy();
    expect(screen.queryByText("This dashboard is empty.")).toBeNull();
    expect(screen.getAllByRole("region").map((el) => el.getAttribute("data-widget"))).toEqual(["n"]);
    expect(document.querySelector('[data-widget="h"]')).toBeTruthy();
  });
});
