import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LanguageProvider } from "@umriss-ui/core";
import { GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { HeadingType, useDashboard } from "../src";
import type { DashboardView } from "../src";

const DEFAULT: DashboardView = {
  widgets: [
    { id: "a", type: "figure", size: "small", options: { name: "Orders" } },
    { id: "b", type: "figure", size: "wide", options: { name: "Backlog" } },
    { id: "c", type: "figure", size: "small", options: { name: "Late" } },
  ],
};

type Hand = ReturnType<typeof useDashboard>;
const hand = {} as Hand;

function Harness({ defaultView = DEFAULT, onViewChange, wide = false }: { defaultView?: DashboardView; onViewChange?: (v: DashboardView) => void; wide?: boolean }) {
  const parts = useDashboard({ defaultView, onViewChange });
  const { Dashboard, WidgetType } = parts;
  useEffect(() => {
    Object.assign(hand, parts);
  });
  return (
    <Dashboard aria-label="Start">
      <HeadingType />
      <WidgetType name="figure" label="Figure" sentence="One number." sizes={{ small: { columns: 3, rows: 2 }, wide: { columns: 6, rows: 2 } }} start="small" defaultOptions={{ name: "Orders" }} title={(o) => o.name}>
        {({ size, options }) => {
          if (wide && size === "small" && options.name === "Orders") throw new Error("no");
          return <span>{`${options.name} at ${size}`}</span>;
        }}
      </WidgetType>
    </Dashboard>
  );
}

const order = () => Array.from(document.querySelectorAll("[data-widget]")).map((el) => el.getAttribute("data-widget"));
const press = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
const menuOf = (title: string) => fireEvent.click(screen.getByRole("button", { name: `Actions for ${title}` }));
const item = (name: string | RegExp) => fireEvent.click(screen.getByRole("menuitem", { name }));
const said = (text: string) => waitFor(() => expect(document.querySelector("[data-umriss-announcer]")?.textContent).toBe(text));

describe("the heading in the editing mode", () => {
  it("is added with a text from the wording, and has a head, a menu and a form", () => {
    render(<Harness defaultView={{ widgets: [] }} />);
    press("Edit");
    press("Add widget");
    press("Add Heading");
    expect(screen.getByRole("heading", { name: "New section" })).toBeTruthy();
    const head = screen.getByRole("group", { name: "New section, place 1 of 1" });
    expect(head.getAttribute("tabindex")).toBe("0");
    menuOf("New section");
    item("Options");
    fireEvent.change(screen.getByRole("textbox", { name: "Text" }), { target: { value: "Deliveries" } });
    expect(screen.getByRole("heading", { name: "Deliveries" })).toBeTruthy();
  });

  it("moves by the keys and is removed by the menu", () => {
    render(<Harness defaultView={{ widgets: [{ id: "h", type: "heading", size: "full", options: { text: "Top" } }, ...DEFAULT.widgets] }} />);
    press("Edit");
    fireEvent.keyDown(screen.getByRole("group", { name: "Top, place 1 of 4" }), { key: "End" });
    expect(order()).toEqual(["a", "b", "c", "h"]);
    menuOf("Top");
    item("Remove");
    expect(order()).toEqual(["a", "b", "c"]);
  });

  it("takes its names from the wording, in German too", () => {
    render(
      <LanguageProvider wording={GERMAN_WORDING}>
        <Harness defaultView={{ widgets: [] }} />
      </LanguageProvider>,
    );
    press("Bearbeiten");
    press("Widget hinzufügen");
    expect(screen.getByText("Ein Titel über die volle Breite.")).toBeTruthy();
    press("Überschrift hinzufügen");
    expect(screen.getByRole("heading", { name: "Neuer Abschnitt" })).toBeTruthy();
  });
});

describe("a view read against the declared types", () => {
  const STRAY: DashboardView = { widgets: [{ id: "x", type: "gone", size: "small", options: {} }, { id: "a", type: "figure", size: "tall", options: { name: "Orders" } }] };

  it("reads what setView is given, and the view the hook returns", () => {
    render(<Harness />);
    act(() => hand.setView(STRAY));
    expect(hand.view.widgets.map((w) => `${w.id}:${w.size}`)).toEqual(["a:small"]);
  });

  it("reads Reset's default, so that Done does not report an unread view", () => {
    const onViewChange = vi.fn();
    render(<Harness defaultView={STRAY} onViewChange={onViewChange} />);
    press("Edit");
    menuOf("Orders");
    item("Remove");
    act(() => hand.reset());
    expect(hand.view.widgets.map((w) => w.id)).toEqual(["a"]);
    press("Done");
    for (const [view] of onViewChange.mock.calls) expect(view.widgets.map((w: { id: string }) => w.id)).not.toContain("x");
  });
});

describe("the actions of the hook announce themselves", () => {
  it("undo, redo, reset, cancel and done, without the bar", async () => {
    render(<Harness />);
    act(() => hand.edit());
    menuOf("Orders");
    item("Remove");
    act(() => hand.undo());
    await said("Undone");
    act(() => hand.redo());
    await said("Redone");
    act(() => hand.reset());
    await said("Reset to the default");
    menuOf("Late");
    item("Remove");
    act(() => hand.done());
    await said("Changes kept");
    act(() => hand.edit());
    act(() => hand.cancel());
    await said("Changes discarded");
  });

  it("says that editing ended when Done changed nothing", async () => {
    render(<Harness />);
    act(() => hand.edit());
    act(() => hand.done());
    await said("Editing ended");
  });
});

describe("a failed widget", () => {
  it("tries again when its size changes", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(<Harness wide />);
    expect(screen.getByText("This widget cannot show anything.")).toBeTruthy();
    press("Edit");
    menuOf("Orders");
    item(/Wide/);
    expect(screen.getByText("Orders at wide")).toBeTruthy();
  });
});

describe("the focus after Remove", () => {
  const head = (title: string) => screen.getByRole("group", { name: new RegExp(`^${title}, place`) });

  it("goes to the next head, the previous when it was last, the Add widget button when none is left", async () => {
    render(<Harness />);
    press("Edit");
    menuOf("Backlog");
    item("Remove");
    await waitFor(() => expect(document.activeElement).toBe(head("Late")));
    menuOf("Late");
    item("Remove");
    await waitFor(() => expect(document.activeElement).toBe(head("Orders")));
    menuOf("Orders");
    item("Remove");
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("button", { name: "Add widget" })));
  });
});
