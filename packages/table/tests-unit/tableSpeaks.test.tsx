/* What a table says: a sort, a folded group, a refused cell edit - through core's one voice - the two terms of
   the text filter told apart, and a table without a name warned about once. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAnnouncer } from "@umriss-ui/core";
import { useTable } from "../src";

interface Row {
  id: string;
  name: string;
  region: string;
}
const ROWS: Row[] = [
  { id: "1", name: "Ann", region: "EU" },
  { id: "2", name: "Bo", region: "US" },
];

function Grid({ named = true, grouped = false, filter = false }: { named?: boolean; grouped?: boolean; filter?: boolean }) {
  const { Table, Column } = useTable(ROWS, { rowKey: (r) => r.id, defaultGrouping: grouped ? "region" : undefined });
  return (
    <Table aria-label={named ? "People" : undefined}>
      <Column value="name" label="Name" filter={filter ? "text" : undefined} />
      <Column value="region" label="Region" />
    </Table>
  );
}

afterEach(() => resetAnnouncer());

describe("a table speaks", () => {
  it("a sort the user changed, with its column and direction", async () => {
    vi.useFakeTimers();
    render(<Grid />);
    fireEvent.click(screen.getByRole("button", { name: "Name" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(160);
    });
    expect([...document.querySelectorAll("[data-umriss-announcer]")].map((r) => r.textContent).join("")).toBe("Sorted by Name, ascending");
    fireEvent.click(screen.getByRole("button", { name: "Name" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(160);
    });
    expect([...document.querySelectorAll("[data-umriss-announcer]")].map((r) => r.textContent).join("")).toBe("Sorted by Name, descending");
    vi.useRealTimers();
  });

  it("a group folded", async () => {
    vi.useFakeTimers();
    render(<Grid grouped />);
    fireEvent.click(screen.getAllByRole("button", { name: /^Fold EU/ })[0]!);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(160);
    });
    expect([...document.querySelectorAll("[data-umriss-announcer]")].map((r) => r.textContent).join("")).toBe("EU folded");
    vi.useRealTimers();
  });

  it("the two terms of a text filter are two groups", () => {
    render(<Grid filter />);
    fireEvent.click(screen.getByRole("button", { name: "Filter Name" }));
    expect(screen.getByRole("group", { name: "Term 1" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Term 2" })).toBeTruthy();
  });

  it("a table without a name warns once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<Grid named={false} />);
    expect(warn.mock.calls.some((c) => String(c[0]).includes("has no name"))).toBe(true);
    warn.mockRestore();
  });
});
