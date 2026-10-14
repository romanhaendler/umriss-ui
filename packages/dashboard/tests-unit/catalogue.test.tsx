import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useDashboard } from "../src";
import type { DashboardView } from "../src";

const DEFAULT: DashboardView = { widgets: [{ id: "a", type: "figure", size: "small", options: { name: "Orders" } }] };

function Harness({ catalogue, view = DEFAULT, onViewChange }: { catalogue?: string[]; view?: DashboardView; onViewChange?: (v: DashboardView) => void }) {
  const { Dashboard, WidgetType } = useDashboard({ defaultView: view, onViewChange });
  return (
    <Dashboard aria-label="Start" catalogue={catalogue}>
      <WidgetType
        name="figure"
        label="Figure"
        sentence="One number."
        sizes={{ small: { columns: 3, rows: 2 }, wide: { columns: 6, rows: 2 } }}
        start="small"
        defaultOptions={{ name: "Backlog" }}
        title={(options) => options.name}
        form={({ options, change }) => <input aria-label="Name" value={options.name} onChange={(event) => change({ name: event.target.value })} />}
      >
        {({ options }) => <span>{options.name}</span>}
      </WidgetType>
      <WidgetType name="note" label="Note" sentence="A line of text." sizes={{ full: { columns: 12, rows: 1 } }} start="full" defaultOptions={{}}>
        {() => <span>note</span>}
      </WidgetType>
    </Dashboard>
  );
}

const press = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
const order = () => screen.getAllByRole("region").map((el) => el.getAttribute("data-widget"));
const said = (text: string) => waitFor(() => expect(document.querySelector("[data-umriss-announcer]")?.textContent).toBe(text));

describe("the catalogue", () => {
  it("lists every type with its sentence and footprint, and adds at the end with the defaults", async () => {
    render(<Harness />);
    expect(screen.queryByRole("button", { name: "Add widget" })).toBeNull();
    press("Edit");
    press("Add widget");
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("One number.")).toBeTruthy();
    expect(within(dialog).getByText("A line of text.")).toBeTruthy();
    expect(within(dialog).getAllByRole("img").length).toBe(2);
    fireEvent.click(within(dialog).getByRole("button", { name: "Add Figure" }));
    expect(order()).toHaveLength(2);
    expect(screen.getByRole("region", { name: "Backlog" })).toBeTruthy();
    expect(screen.getByRole("dialog")).toBeTruthy();
    await said("Backlog added, place 2 of 2");
  });

  it("lists only the types the application chose", () => {
    render(<Harness catalogue={["note"]} />);
    press("Edit");
    press("Add widget");
    expect(screen.queryByRole("button", { name: "Add Figure" })).toBeNull();
    expect(screen.getByRole("button", { name: "Add Note" })).toBeTruthy();
  });

  it("is undone by Cancel, and lets one type stand twice with different options", () => {
    const onViewChange = vi.fn();
    render(<Harness onViewChange={onViewChange} />);
    press("Edit");
    press("Add widget");
    fireEvent.click(screen.getByRole("button", { name: "Add Figure" }));
    fireEvent.click(screen.getByRole("button", { name: "Add Figure" }));
    const ids = order();
    expect(new Set(ids).size).toBe(3);
    press("Done");
    expect(onViewChange.mock.calls[0]![0].widgets.map((w: { id: string }) => w.id)).toEqual(ids);
    press("Edit");
    press("Add widget");
    fireEvent.click(screen.getByRole("button", { name: "Add Note" }));
    expect(order()).toHaveLength(4);
    press("Cancel");
    expect(order()).toHaveLength(3);
  });

  it("points to the catalogue when the dashboard is empty in the mode", () => {
    render(<Harness view={{ widgets: [] }} />);
    expect(screen.queryByText(/Choose Add widget/)).toBeNull();
    press("Edit");
    expect(screen.getByText(/Choose Add widget/)).toBeTruthy();
  });
});

describe("the options", () => {
  it("are changed through the type's form, as steps of the draft, and are cancelled with it", async () => {
    const onViewChange = vi.fn();
    render(<Harness onViewChange={onViewChange} />);
    press("Edit");
    press("Actions for Orders");
    fireEvent.click(screen.getByRole("menuitem", { name: "Options" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), { target: { value: "Late" } });
    expect(screen.getByRole("region", { name: "Late" })).toBeTruthy();
    await said("Late: options changed");
    press("Cancel");
    expect(screen.getByRole("region", { name: "Orders" })).toBeTruthy();
    expect(onViewChange).not.toHaveBeenCalled();
  });

  it("show no entry in the menu of a type without a form", () => {
    render(<Harness view={{ widgets: [{ id: "n", type: "note", size: "full", options: {} }] }} />);
    press("Edit");
    press("Actions for Note");
    expect(screen.queryByRole("menuitem", { name: "Options" })).toBeNull();
  });
});
