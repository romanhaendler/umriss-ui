// @vitest-environment jsdom

/* The label of a limit in the axis band (props-to-examples 06, found while
   writing LimitLine/05): it takes the limit's own `color`, and on an x axis it
   covers a tick label as it does on a y axis - the tick is left out, not shown
   half. jsdom measures nothing, so a text here is 7 px per character and one
   14 px line, as in the layout tests. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { Chart, LimitLine, Line, XAxis, YAxis } from "../src";
import { renderChart } from "./renderChart";

interface Row {
  t: number;
  a: number;
}

const data: Row[] = Array.from({ length: 11 }, (_, i) => ({ t: i * 10, a: 20 + i }));

const rect = (width: number, height: number) =>
  ({ x: 0, y: 0, top: 0, left: 0, right: width, bottom: height, width, height, toJSON: () => ({}) }) as DOMRect;

let unmount: (() => void) | null = null;
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

async function chart(limit: React.ReactNode): Promise<HTMLElement> {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    if (this.classList.contains("uc-plot")) return rect(400, 300);
    if (this.classList.contains("uc-measure")) return rect((this.textContent ?? "").length * 7, 14);
    return rect(0, 0);
  });
  const rendered = await renderChart(
    <Chart data={data} ariaLabel="Limit labels" height={300}>
      <XAxis accessor={(d: Row) => d.t} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
      <YAxis accessor={(d: Row) => d.a} domain={[0, 50]} />
      <Line accessor={(d: Row) => d.a} />
      {limit}
    </Chart>,
  );
  unmount = rendered.unmount;
  return rendered.host;
}

const label = (host: HTMLElement) => host.querySelector<HTMLElement>(".uc-limit-label");
const xTicks = (host: HTMLElement) =>
  [...host.querySelectorAll(".uc-axis-x .uc-tick-label")].map((t) => t.textContent);

describe("A limit's label - its colour", () => {
  it("takes the limit's own colour, as the line does", async () => {
    const host = await chart(<LimitLine value={30} color="#123456" label="Release freeze" />);
    expect(label(host)?.textContent).toBe("Release freeze");
    expect(label(host)?.style.color).toBe("rgb(18, 52, 86)");
  });

  it("leaves the colour to the severity without one", async () => {
    const host = await chart(<LimitLine value={30} label="Too warm" />);
    expect(label(host)?.dataset.severity).toBe("alarm");
    expect(label(host)?.style.color).toBe("");
  });
});

describe("A limit's label on an x axis", () => {
  it("covers the tick label it would stand on, and only that one", async () => {
    // "Freeze" starts at 38 and reaches over the tick at 40, not to 60.
    const host = await chart(<LimitLine orientation="x" value={38} label="Freeze" />);
    expect(xTicks(host)).toEqual(["0", "20", "60", "80", "100"]);
  });

  it("leaves every tick label where it stands clear of them", async () => {
    const host = await chart(<LimitLine orientation="x" value={50} label="Hi" />);
    expect(xTicks(host)).toEqual(["0", "20", "40", "60", "80", "100"]);
  });
});
