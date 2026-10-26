/* A format that does not fit the column's first value says so once, naming the
   column; a fitting or an empty column stays silent. */

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTable } from "../src";

interface Row {
  id: string;
  at: unknown;
  n: unknown;
}

function Probe({ rows, atId, nId, atFormat, nFormat }: { rows: Row[]; atId: string; nId: string; atFormat: unknown; nFormat: unknown }) {
  const { Table, Column } = useTable(rows, { rowKey: (r) => r.id });
  return (
    <Table ariaLabel="Probe">
      <Column value="id" label="Id" rowHeader />
      <Column id={atId} value={"at" as never} label="At" format={atFormat as never} />
      <Column id={nId} value={"n" as never} label="N" format={nFormat as never} />
    </Table>
  );
}

const warnings = (spy: { mock: { calls: unknown[][] } }) => spy.mock.calls.map((c) => String(c[0]));

describe("a format that does not fit", () => {
  afterEach(() => vi.restoreAllMocks());

  it("warns once per column for ISO strings, epoch numbers and numeric strings", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const rows: Row[] = [{ id: "a", at: "2024-01-02T00:00:00Z", n: "1.5" }];
    const view = render(<Probe rows={rows} atId="iso" nId="str" atFormat="dateTime" nFormat={{ decimals: 2 }} />);
    view.rerender(<Probe rows={[...rows]} atId="iso" nId="str" atFormat="dateTime" nFormat={{ decimals: 2 }} />);
    render(<Probe rows={[{ id: "a", at: 1700000000000, n: 1 }]} atId="epoch" nId="ok1" atFormat="date" nFormat="count" />);
    const w = warnings(spy);
    expect(w.filter((m) => m.includes('"iso"'))).toHaveLength(1);
    expect(w.filter((m) => m.includes('"str"'))).toHaveLength(1);
    expect(w.filter((m) => m.includes('"epoch"'))).toHaveLength(1);
    expect(w.some((m) => m.includes('"ok1"'))).toBe(false);
  });

  it("stays silent for Dates, numbers and empty columns", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Probe rows={[{ id: "a", at: new Date(0), n: 3 }]} atId="d-ok" nId="n-ok" atFormat="date" nFormat="percent" />);
    render(<Probe rows={[{ id: "a", at: null, n: undefined }]} atId="d-empty" nId="n-empty" atFormat="time" nFormat={{ decimals: 1 }} />);
    expect(warnings(spy).filter((m) => /d-ok|n-ok|d-empty|n-empty/.test(m))).toEqual([]);
  });
});
