/* A missing or non-function rowKey and a column field no row has say so in development, once, and do not throw. */

import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTable } from "../src";

const rows = Array.from({ length: 30 }, (_, i) => ({ id: `r${i}`, n: i }));
const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
afterEach(() => warn.mockClear());
const said = (needle: string) => warn.mock.calls.filter((c) => String(c[0]).includes(needle));

function Grid({ rowKey, field = "n" }: { rowKey: unknown; field?: string }) {
  const t = useTable(rows, { rowKey } as never);
  return (
    <t.Table aria-label="x">
      <t.Column id="f" label="F" value={field as "n"} />
    </t.Table>
  );
}

describe("rowKey", () => {
  it.each([["missing", undefined], ["a string", "id"]])("%s warns and renders no rows", (_n, rowKey) => {
    const { container, rerender } = render(<Grid rowKey={rowKey} />);
    rerender(<Grid rowKey={rowKey} />);
    expect(said("rowKey must be a function (row) => string").length).toBeGreaterThan(0);
    expect(container.querySelectorAll("tbody td:not([colspan])")).toHaveLength(0);
  });
});

describe("a field no row has", () => {
  it("warns once, naming the field", async () => {
    const { rerender } = render(<Grid rowKey={(r: { id: string }) => r.id} field="nn" />);
    await waitFor(() => expect(said('"nn"')).toHaveLength(1));
    rerender(<Grid rowKey={(r: { id: string }) => r.id} field="nn" />);
    expect(said('"nn"')).toHaveLength(1);
  });

  it("is silent for a field the rows have", async () => {
    render(<Grid rowKey={(r: { id: string }) => r.id} />);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    expect(warn).not.toHaveBeenCalled();
  });
});
