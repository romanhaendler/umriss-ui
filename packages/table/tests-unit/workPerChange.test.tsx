/* A render that changes nothing the layout or the selection depends on does
   no work: no measurement of flex heads, no serialising of the selection. */

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTable, useTableSelection } from "../src";

const ROWS = Array.from({ length: 50_000 }, (_, i) => ({ id: `r${i}`, name: `Row ${i}` }));
const KEYS = ROWS.map((r) => r.id);

function Rows({ onSelectionChange, label = "Name" }: { onSelectionChange: (keys: string[]) => void; label?: string }) {
  const own = useTableSelection(KEYS);
  const { Table, Column } = useTable(ROWS.slice(0, 20), { rowKey: (r) => r.id, onSelectionChange, selection: own });
  return (
    <Table selectable aria-label="Rows">
      <Column value="id" label="Id" />
      <Column value="name" label={label} flex={1} />
    </Table>
  );
}

afterEach(() => vi.restoreAllMocks());

function Loading({ rows }: { rows: typeof ROWS }) {
  const { Table, Column } = useTable(rows, { rowKey: (r) => r.id });
  return (
    <Table aria-label="Loading">
      <Column value="id" label="Id" />
      <Column value="name" label="Name" flex={1} />
    </Table>
  );
}

describe("work per change", () => {
  it("refits the flex heads when rows arrive after mount", () => {
    const empty: typeof ROWS = [];
    const loaded = ROWS.slice(0, 5);
    const measure = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect");
    const flexCalls = () => measure.mock.contexts.filter((c) => (c as HTMLElement).tagName === "TH" && (c as HTMLElement).dataset.flex).length;
    const { rerender } = render(<Loading rows={empty} />);
    const first = flexCalls();
    rerender(<Loading rows={empty} />);
    expect(flexCalls()).toBe(first);
    rerender(<Loading rows={loaded} />);
    expect(flexCalls()).toBeGreaterThan(first);
  });

  it("re-renders a large selection without a call or a serialisation", () => {
    const fn = vi.fn();
    const { rerender } = render(<Rows onSelectionChange={fn} />);
    const stringify = vi.spyOn(JSON, "stringify");
    rerender(<Rows onSelectionChange={fn} />);
    expect(fn).not.toHaveBeenCalled();
    expect(stringify.mock.calls.filter(([v]) => Array.isArray(v) && v.some(Array.isArray))).toHaveLength(0);
  });

  it("measures flex heads once, not on a render that changes nothing", () => {
    const fn = vi.fn();
    const measure = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect");
    const { rerender } = render(<Rows onSelectionChange={fn} />);
    const flexCalls = () => measure.mock.contexts.filter((c) => (c as HTMLElement).tagName === "TH" && (c as HTMLElement).dataset.flex).length;
    const first = flexCalls();
    expect(first).toBeGreaterThan(0);
    rerender(<Rows onSelectionChange={fn} />);
    rerender(<Rows onSelectionChange={fn} label="Name " />);
    expect(flexCalls()).toBe(first);
  });
});
