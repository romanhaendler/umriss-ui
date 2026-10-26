// @vitest-environment jsdom

/* Rows that are not an array read as none. A pandas frame written with orient="columns" or a typed array draws
   "No data" and warns once in development; rows still loading draw empty without a word. */

import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { ControlChart, useChart } from "../src";

const rect = (width: number, height: number) =>
  ({ x: 0, y: 0, top: 0, left: 0, right: width, bottom: height, width, height, toJSON: () => ({}) }) as DOMRect;

let cleanups: (() => void)[] = [];
let warn: MockInstance<typeof console.warn>;
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    return this.classList.contains("uc-plot") ? rect(400, 300) : rect(0, 0);
  });
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  for (const c of cleanups) c();
  cleanups = [];
  vi.restoreAllMocks();
});

interface Props {
  rows: unknown;
  own?: unknown;
  control?: unknown;
  tag: string;
}

function Plot({ rows, own, control, tag }: Props) {
  const { Chart, XAxis, YAxis, Line } = useChart(rows as { t: number; a: number }[]);
  return (
    <Chart aria-label={tag} height={300}>
      <XAxis value="t" />
      <YAxis />
      <Line value="a" name={`A ${tag}`} data={own as undefined} />
      {control !== undefined && <ControlChart value="a" name={`C ${tag}`} violationName={`V ${tag}`} origin={{ kind: "given", center: 0, sigma: 1 }} data={control as { a: number }[]} />}
    </Chart>
  );
}

async function render(props: Props): Promise<HTMLElement> {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => root.render(<Plot {...props} />));
  await act(async () => {
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
  });
  cleanups.push(() => {
    act(() => root.unmount());
    host.remove();
  });
  return host;
}

const emptyText = (host: HTMLElement) => host.querySelector(".uc-empty")?.textContent ?? null;
const said = () => warn.mock.calls.map((c) => String(c[0]));

describe("rows that are not an array", () => {
  it("names a typed array and Array.from, once", async () => {
    const host = await render({ rows: new Float64Array([1, 2, 3]), tag: "typed" });
    expect(emptyText(host)).toBe("No data");
    const own = said().filter((m) => m.includes("Float64Array"));
    expect(own).toHaveLength(1);
    expect(own[0]).toContain("Array.from");
  });

  it("names the first keys of a column object", async () => {
    const host = await render({ rows: { t: [1, 2], a: [3, 4], b: [5], c: [6] }, tag: "columns" });
    expect(emptyText(host)).toBe("No data");
    expect(said().some((m) => m.includes("t, a, b") && !m.includes(", c"))).toBe(true);
  });

  it("reads a series' own data that is not an array as none", async () => {
    await render({ rows: [{ t: 1, a: 1 }], own: { t: [1] }, tag: "own" });
    expect(said().some((m) => m.includes('series "A own"'))).toBe(true);
  });

  it("says nothing for undefined or null rows, series data and control data", async () => {
    const host = await render({ rows: undefined, tag: "u1" });
    expect(emptyText(host)).toBe("No data");
    await render({ rows: null, own: null, tag: "n1" });
    await render({ rows: [{ t: 1, a: 1 }], control: null, tag: "c1" });
    await render({ rows: [{ t: 1, a: 1 }], control: undefined, own: undefined, tag: "c2" });
    expect(warn).not.toHaveBeenCalled();
  });

  it("says nothing over a proper array", async () => {
    await render({ rows: [{ t: 1, a: 1 }, { t: 2, a: 2 }], tag: "fine" });
    expect(warn).not.toHaveBeenCalled();
  });

  it("warns for a ControlChart's data", async () => {
    await render({ rows: [{ t: 1, a: 1 }], control: { a: [1] }, tag: "ctl" });
    expect(said().some((m) => m.includes("ControlChart"))).toBe(true);
  });
});
