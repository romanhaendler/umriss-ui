/* Row filters (table-filters 08): a condition the application defines over the
   whole row, set by a control of its own, that the table treats as every other
   condition - in the ratio, under "Reset", in the view and in the report to a
   server. */

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pagination, Toolbar, rowFilter, useTable } from "../src";
import type { ManualView, Table, TableView } from "../src";

interface Shipment {
  id: string;
  tour: string;
  status: "delivered" | "out for delivery" | "failed attempt";
  due: number;
}

const SHIPMENTS: Shipment[] = [
  { id: "S-1", tour: "T-01", status: "delivered", due: 10 },
  { id: "S-2", tour: "T-01", status: "out for delivery", due: 20 },
  { id: "S-3", tour: "T-02", status: "failed attempt", due: 5 },
  { id: "S-4", tour: "T-03", status: "out for delivery", due: 40 },
];

const tours = rowFilter({
  id: "tours",
  label: "Tours",
  matches: (s: Shipment, chosen: readonly string[]) => chosen.includes(s.tour),
});

const overdue = rowFilter({
  id: "overdue",
  label: "Overdue",
  matches: (s: Shipment, o: { before: number; includeFailed: boolean }) =>
    s.due < o.before && (s.status === "out for delivery" || (o.includeFailed && s.status === "failed attempt")),
  describe: (o) => (o.includeFailed ? `before ${o.before}, failed included` : `before ${o.before}`),
});

let t: Table<Shipment> | null = null;
const capture = (table: Table<Shipment>) => {
  t = table;
};

function Shipments({ initialView, pageSize }: { initialView?: TableView; pageSize?: number }) {
  const table = useTable(SHIPMENTS, { rowKey: (s) => s.id, rowFilters: [tours, overdue], initialView, pageSize });
  capture(table);
  const { Table: Frame, Column } = table;
  return (
    <Frame ariaLabel="Shipments">
      <Toolbar />
      <Column value="id" label="Shipment" rowHeader />
      <Column value="status" label="Status" filter="list" />
      {pageSize !== undefined && <Pagination />}
    </Frame>
  );
}

const ids = (root: HTMLElement) => Array.from(root.querySelectorAll("tbody th"), (th) => th.textContent);

afterEach(() => {
  t = null;
  vi.restoreAllMocks();
});

describe("a row filter restricts by the whole row", () => {
  it("by a field no column shows", () => {
    const { container } = render(<Shipments />);
    act(() => t!.setFilter(tours, ["T-01", "T-03"]));
    expect(ids(container)).toEqual(["S-1", "S-2", "S-4"]);
  });

  it("by a question over several fields, with what varies in the condition", () => {
    const { container } = render(<Shipments />);
    act(() => t!.setFilter(overdue, { before: 30, includeFailed: false }));
    expect(ids(container)).toEqual(["S-2"]);
    act(() => t!.setFilter(overdue, { before: 30, includeFailed: true }));
    expect(ids(container)).toEqual(["S-2", "S-3"]);
  });

  it("together with a column's condition and another row filter: all must hold", () => {
    const { container } = render(<Shipments />);
    act(() => {
      t!.setFilter(tours, ["T-01", "T-03"]);
      t!.setFilter("status", ["out for delivery"]);
    });
    expect(ids(container)).toEqual(["S-2", "S-4"]);
    act(() => t!.setFilter(overdue, { before: 30, includeFailed: false }));
    expect(ids(container)).toEqual(["S-2"]);
  });

  it("null lifts it", () => {
    const { container } = render(<Shipments />);
    act(() => t!.setFilter(tours, ["T-02"]));
    act(() => t!.setFilter(tours, null));
    expect(ids(container)).toEqual(["S-1", "S-2", "S-3", "S-4"]);
  });
});

describe("its condition is a condition like any other", () => {
  it("conditionOf reads it back, null while lifted", () => {
    render(<Shipments />);
    expect(t!.conditionOf(tours)).toBeNull();
    act(() => t!.setFilter(tours, ["T-02"]));
    expect(t!.conditionOf(tours)).toEqual(["T-02"]);
  });

  it("counts in the ratio, and Reset lifts it", () => {
    const { container } = render(<Shipments />);
    act(() => t!.setFilter(tours, ["T-02"]));
    expect(screen.getByRole("status").textContent).toBe("1 of 4");
    fireEvent.click(within(container).getByRole("button", { name: "Reset" }));
    expect(ids(container)).toEqual(["S-1", "S-2", "S-3", "S-4"]);
    expect(t!.conditionOf(tours)).toBeNull();
  });

  it("a change goes back to page one", () => {
    render(<Shipments pageSize={1} />);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(t!.page).toBe(2);
    act(() => t!.setFilter(tours, ["T-01"]));
    expect(t!.page).toBe(1);
  });

  it("stands in the view under its id, and initialView restores it in the first render", () => {
    render(<Shipments />);
    act(() => t!.setFilter(tours, ["T-03"]));
    expect(t!.view.conditions).toEqual({ tours: ["T-03"] });
    const { container } = render(<Shipments initialView={{ conditions: { tours: ["T-02"] } }} />);
    expect(ids(container)).toEqual(["S-3"]);
  });
});

describe("its chip", () => {
  it("with describe it stands in the toolbar as 'label: text' and its cross lifts it", () => {
    const { container } = render(<Shipments />);
    act(() => t!.setFilter(overdue, { before: 30, includeFailed: true }));
    const chips = within(container).getByRole("list", { name: "Active filters" });
    expect(chips.textContent).toContain("Overdue");
    expect(chips.textContent).toContain("before 30, failed included");
    fireEvent.click(within(chips).getByRole("button", { name: /^Remove Overdue/ }));
    expect(t!.conditionOf(overdue)).toBeNull();
  });

  it("without describe there is none - the application's control shows it", () => {
    const { container } = render(<Shipments />);
    act(() => t!.setFilter(tours, ["T-01"]));
    expect(within(container).queryByRole("list", { name: "Active filters" })).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("2 of 4");
  });
});

it("a row filter the table was not given is passed over, with a warning", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const stray = rowFilter({ id: "stray", label: "Stray", matches: (s: Shipment, x: boolean) => x && s.due > 0 });
  const { container } = render(<Shipments />);
  act(() => t!.setFilter(stray, true));
  expect(ids(container)).toEqual(["S-1", "S-2", "S-3", "S-4"]);
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('"stray"'));
});

it("in manual mode it goes to the server and the table filters nothing itself", () => {
  const views: ManualView[] = [];
  function Server() {
    const table = useTable(SHIPMENTS, {
      rowKey: (s) => s.id,
      rowFilters: [tours],
      manual: true,
      rowCount: 4,
      onViewChange: (view) => views.push(view),
    });
    capture(table);
    const { Table: Frame, Column } = table;
    return (
      <Frame>
        <Column value="id" label="Shipment" rowHeader />
      </Frame>
    );
  }
  const { container } = render(<Server />);
  act(() => t!.setFilter(tours, ["T-02"]));
  expect(views.at(-1)?.conditions).toEqual({ tours: ["T-02"] });
  expect(ids(container)).toEqual(["S-1", "S-2", "S-3", "S-4"]);
});

describe("found in review", () => {
  it("a table with only row filters puts up a toolbar of its own for the ratio and the chip", () => {
    function Bare() {
      const table = useTable(SHIPMENTS, { rowKey: (s) => s.id, rowFilters: [overdue] });
      capture(table);
      const { Table: Frame, Column } = table;
      return (
        <Frame>
          <Column value="id" label="Shipment" rowHeader />
        </Frame>
      );
    }
    const { container } = render(<Bare />);
    act(() => t!.setFilter(overdue, { before: 30, includeFailed: false }));
    expect(screen.getByRole("status").textContent).toBe("1 of 4");
    expect(within(container).getByRole("list", { name: "Active filters" }).textContent).toContain("Overdue");
  });

  it("a row filter made anew on every render is the same filter by its id", () => {
    const make = () =>
      rowFilter({ id: "tours", label: "Tours", matches: (s: Shipment, c: readonly string[]) => c.includes(s.tour) });
    function Inline() {
      const table = useTable(SHIPMENTS, { rowKey: (s) => s.id, rowFilters: [make()] });
      capture(table);
      const { Table: Frame, Column } = table;
      return (
        <Frame>
          <Column value="id" label="Shipment" rowHeader />
        </Frame>
      );
    }
    const { container } = render(<Inline />);
    act(() => t!.setFilter(make(), ["T-02"]));
    expect(ids(container)).toEqual(["S-3"]);
  });

  it("a column of the same id that leaves does not take the row filter's condition along", () => {
    const tour = rowFilter({ id: "tour", label: "Tour", matches: (s: Shipment, c: readonly string[]) => c.includes(s.tour) });
    function Clash({ withColumn }: { withColumn: boolean }) {
      const table = useTable(SHIPMENTS, { rowKey: (s) => s.id, rowFilters: [tour] });
      capture(table);
      const { Table: Frame, Column } = table;
      return (
        <Frame>
          <Column value="id" label="Shipment" rowHeader />
          {withColumn && <Column value="tour" label="Tour" />}
        </Frame>
      );
    }
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container, rerender } = render(<Clash withColumn />);
    act(() => t!.setFilter(tour, ["T-03"]));
    rerender(<Clash withColumn={false} />);
    expect(ids(container)).toEqual(["S-4"]);
  });
});
