// @vitest-environment jsdom

/* charts-essentials 05: a chart without anything to show says so. It drew an
   empty frame on [0, 1] and said nothing. Axes and frame stay; the words stand
   in the middle of the plot area. jsdom lays nothing out, so the plot is given
   a size of its own. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { useChart } from "../src";

interface Row {
  t: number;
  a: number | null;
}

const rect = (width: number, height: number) =>
  ({ x: 0, y: 0, top: 0, left: 0, right: width, bottom: height, width, height, toJSON: () => ({}) }) as DOMRect;

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    return this.classList.contains("uc-plot") ? rect(400, 300) : rect(0, 0);
  });
});

let cleanup: (() => void) | null = null;
afterEach(() => {
  cleanup?.();
  cleanup = null;
  vi.restoreAllMocks();
});

type Extra = { empty?: ReactNode; hidden?: boolean };

function Empty({ data, extra }: { data: Row[]; extra: Extra }) {
  // A view handed in is taken as given: it may hide the only series.
  const { Chart, XAxis, YAxis, Line } = useChart(data, { initialView: extra.hidden === true ? { hidden: ["A"] } : undefined });
  return (
    <Chart ariaLabel="Empty state" height={300} empty={extra.empty}>
      <XAxis value="t" />
      <YAxis />
      <Line value="a" name="A" />
    </Chart>
  );
}

async function render(data: Row[], extra: Extra = {}): Promise<HTMLElement> {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => {
    root.render(<Empty data={data} extra={extra} />);
  });
  await act(async () => {
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
  });
  cleanup = () => {
    act(() => root.unmount());
    host.remove();
  };
  return host;
}

const emptyText = (host: HTMLElement) => host.querySelector(".uc-empty")?.textContent ?? null;

describe("Chart empty", () => {
  it("says \"No data\" without data, and keeps its axes", async () => {
    const host = await render([]);
    expect(emptyText(host)).toBe("No data");
    expect(host.querySelectorAll(".uc-axis")).toHaveLength(2);
  });

  it("says it where every point is a gap", async () => {
    const host = await render([
      { t: 0, a: null },
      { t: 1, a: null },
    ]);
    expect(emptyText(host)).toBe("No data");
  });

  it("says it where the only series is hidden", async () => {
    const host = await render([{ t: 0, a: 1 }], { hidden: true });
    expect(emptyText(host)).toBe("No data");
  });

  it("says nothing where one point is there", async () => {
    const host = await render([
      { t: 0, a: null },
      { t: 1, a: 4 },
    ]);
    expect(emptyText(host)).toBeNull();
  });

  it("says what the caller gives it, in the middle of the plot area", async () => {
    const host = await render([], { empty: <strong>Line 3 is not reporting</strong> });
    const empty = host.querySelector<HTMLElement>(".uc-empty");
    expect(empty?.querySelector("strong")?.textContent).toBe("Line 3 is not reporting");
    expect(Number.parseFloat(empty?.style.width ?? "0")).toBeGreaterThan(0);
  });
});
