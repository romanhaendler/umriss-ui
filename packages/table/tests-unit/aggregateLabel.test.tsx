/* `aggregateLabel`: the name of an aggregate of one's own. */

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { useTable } from "../src";
import NamedAggregates from "../demo/examples/Aggregate/10-name-your-own-aggregate";

interface Row {
  id: string;
  region: string;
  cycle: number;
}

const ROWS: Row[] = [
  { id: "a", region: "N", cycle: 40 },
  { id: "b", region: "N", cycle: 44 },
  { id: "c", region: "S", cycle: 41 },
];
const maxOf = (values: readonly number[]) => Math.max(...values);

function Sheet({ label, aggregate = maxOf }: { label?: string; aggregate?: ((v: readonly number[]) => number) | "sum" }) {
  const { Table, Column } = useTable(ROWS, { rowKey: (r) => r.id, defaultGrouping: "region" });
  return (
    <Table>
      <Column value="region" label="Region" />
      <Column value="id" label="Id" rowHeader />
      <Column value="cycle" label="Cycle" {...({ aggregate, aggregateLabel: label } as unknown as Record<string, never>)} />
    </Table>
  );
}

const foot = (root: HTMLElement) => root.querySelector("tfoot td[data-footer]");

afterEach(() => vi.restoreAllMocks());

describe("aggregateLabel", () => {
  it("stands before the value in the footer and is what is read", () => {
    const { container } = render(<Sheet label="Maximum cycle" />);
    expect(foot(container)?.textContent).toBe("Maximum cycle 44");
  });

  it("an unnamed function reads as before", () => {
    const { container } = render(<Sheet />);
    expect(foot(container)?.textContent).toBe("Aggregate 44");
  });

  it("a group header shows the value without the name", () => {
    const { container } = render(<Sheet label="Maximum cycle" />);
    const header = container.querySelector("tbody tr[data-line='header']")!;
    expect(header.textContent).not.toContain("Maximum cycle");
    expect(header.textContent).toContain("44");
  });

  it("beside a built-in kind changes nothing and warns once in development", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const first = render(<Sheet aggregate="sum" label="Total cycle" />);
    first.rerender(<Sheet aggregate="sum" label="Total cycle" />);
    expect(foot(first.container)?.textContent).toBe("ΣSum 125");
    expect(warn.mock.calls.filter(([m]) => String(m).includes("aggregateLabel"))).toHaveLength(1);
  });

  it("does not warn in a production build", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    const [{ render: renderAgain }, { useTable: useTableAgain }] = await Promise.all([import("@testing-library/react"), import("../src")]);
    function Bare() {
      const { Table, Column } = useTableAgain(ROWS, { rowKey: (r) => r.id });
      return createElement(
        Table,
        null,
        createElement(Column, { value: "id", label: "Id", rowHeader: true }),
        createElement(Column, { value: "cycle", label: "Cycle", aggregate: "sum", aggregateLabel: "Other" } as never),
      );
    }
    renderAgain(createElement(Bare));
    expect(warn).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });
});

describe("the example's functions, worked out by hand", () => {
  it("names a median and a sample standard deviation", () => {
    const { container } = render(<NamedAggregates />);
    const feet = Array.from(container.querySelectorAll("tfoot td[data-footer]")).map((td) => td.textContent);
    /* cycle times 38 40 41 43 44 47: the mean of 41 and 43 is 42.
       scrap rates 2 3 4 4 5 6: mean 4, squared deviations 10, over n - 1 = 5 is 2, root 1.41 */
    expect(feet).toEqual(["Median 42", "Std. deviation 1.41"]);
  });
});
