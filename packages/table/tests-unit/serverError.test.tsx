/* An error in server mode: the message stands in place of the rows, with "Try
   again" reporting the current request once more. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useTable } from "../src";
import type { TableRequest } from "../src";

interface Row {
  id: string;
}

let reports: TableRequest[] = [];

function Server({ error, answers, loading }: { error?: string; answers?: TableRequest; loading?: boolean }) {
  const t = useTable<Row>([{ id: "r1" }], {
    rowKey: (r) => r.id,
    server: true,
    rowCount: 1,
    onRequest: (request) => reports.push(request),
    answers,
    error,
  });
  const { Table: Frame, Column } = t;
  return (
    <Frame aria-label="Orders" loading={loading}>
      <Column value="id" label="Id" rowHeader />
    </Frame>
  );
}

beforeEach(() => {
  reports = [];
});

describe("error", () => {
  it("replaces the rows, wins over loading, and is announced", () => {
    render(<Server error="Boom" loading />);
    expect(screen.getByRole("alert").textContent).toContain("Boom");
    expect(screen.queryAllByRole("rowheader")).toHaveLength(0);
    expect(screen.getByRole("table", { hidden: true }).getAttribute("aria-busy")).toBeNull();
  });

  it("is read only while answers is the current request", () => {
    const { rerender } = render(<Server />);
    const current = reports[0]!;
    rerender(<Server error="Boom" answers={{ ...current, page: 5 }} />);
    expect(screen.queryByRole("alert")).toBeNull();
    rerender(<Server error="Boom" answers={current} />);
    expect(screen.getByRole("alert")).toBeTruthy();
  });

  it("Try again reports the current request once more, past the dedupe", () => {
    const { rerender } = render(<Server error="Boom" />);
    expect(reports).toHaveLength(1);
    rerender(<Server error="Boom" />);
    expect(reports).toHaveLength(1);
    const button = screen.getByRole("button", { name: "Try again" });
    act(() => button.focus());
    fireEvent.click(button);
    expect(reports).toHaveLength(2);
    expect(reports[1]).toEqual(reports[0]);
  });

  it("shows no totals footer under an error", () => {
    const totals = { id: 100 };
    function Totals({ error }: { error?: string }) {
      const t = useTable<Row>([{ id: "r1" }], { rowKey: (r) => r.id, server: true, rowCount: 1, onRequest: () => {}, totals, error });
      const { Table: Frame, Column } = t;
      return (
        <Frame aria-label="Orders">
          <Column value="id" label="Id" rowHeader aggregate="count" />
        </Frame>
      );
    }
    const { rerender } = render(<Totals />);
    expect(document.querySelector("tfoot")).not.toBeNull();
    rerender(<Totals error="Boom" />);
    expect(document.querySelector("tfoot")).toBeNull();
  });
});
