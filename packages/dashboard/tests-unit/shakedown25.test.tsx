import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Stat } from "@umriss-ui/core";
import { useDashboard } from "../src";
import type { DashboardView } from "../src";

const TWINS: DashboardView = {
  widgets: [
    { id: "a", type: "figure", size: "small", options: { name: "Orders" } },
    { id: "b", type: "figure", size: "small", options: { name: "Orders" } },
    { id: "c", type: "plain", size: "small", options: undefined },
  ],
};

function Harness({ onDraftChange }: { onDraftChange?: (open: boolean) => void }) {
  const { Dashboard, WidgetType } = useDashboard({ defaultView: TWINS, onDraftChange });
  return (
    <Dashboard aria-label="Start">
      <WidgetType name="figure" label="Figure" sentence="One." sizes={{ small: { columns: 3, rows: 2 } }} start="small" defaultOptions={{ name: "Orders" }} title={(o) => o.name}>
        {({ options }) => <span>{options.name}</span>}
      </WidgetType>
      <WidgetType name="plain" label="Plain" sentence="No options." sizes={{ small: { columns: 3, rows: 2 } }} start="small">
        {() => <Stat label="Load" value={3} />}
      </WidgetType>
    </Dashboard>
  );
}

const press = (name: string) => fireEvent.click(screen.getByRole("button", { name }));

describe("widgets of one title", () => {
  it("are told apart by their place in the menu button and the landmark", () => {
    render(<Harness />);
    press("Edit");
    expect(screen.getByRole("button", { name: "Actions for Orders, place 1 of 3" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Actions for Orders, place 2 of 3" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Orders, place 2 of 3" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Actions for Plain" })).toBeTruthy();
  });
});

describe("the bar", () => {
  it("keeps the focus through Edit, Cancel and Done, and says that the mode began", async () => {
    render(<Harness />);
    press("Edit");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Add widget" }));
    await waitFor(() => expect(document.querySelector("[data-umriss-announcer]")?.textContent).toBe("Editing the dashboard"));
    press("Cancel");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Edit" }));
    press("Edit");
    press("Done");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Edit" }));
  });

  it("is left by Escape as by Cancel, unless the catalogue takes it", () => {
    render(<Harness />);
    press("Edit");
    press("Add widget");
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
    fireEvent.keyDown(screen.getByRole("button", { name: "Undo" }), { key: "Escape" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Edit" }));
  });
});

describe("the draft", () => {
  it("is reported closed when the dashboard goes while it stands", () => {
    const onDraftChange = vi.fn();
    const { unmount } = render(<Harness onDraftChange={onDraftChange} />);
    press("Edit");
    unmount();
    expect(onDraftChange.mock.calls).toEqual([[true], [false]]);
  });
});

describe("a widget without options", () => {
  it("needs no defaultOptions, and its Stat marks the body it stands in", () => {
    render(<Harness />);
    expect(screen.getByRole("group", { name: "Load: 3" }).parentElement?.hasAttribute("data-widget-body")).toBe(true);
  });
});
