// @vitest-environment jsdom

/* The control chart brings no text along (library-audit 03).

   `@umriss-ui/charts` has decided to have no text layer: every string it draws
   comes from the caller. The control chart did not keep to that - "OEG", "UEG" and
   a German violation suffix stood as defaults in the component. Without a value
   there is now no label and no name; named, they appear as before. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Chart, ControlChart, Legend, XAxis, YAxis } from "../src";

/* The label of a limit stands in the axis band, and jsdom does not lay that out:
   every element there is of size zero, no limit gets a position. What is
   observable is what the control chart passes to its parts - and that is exactly
   the promise. */
const passed = vi.hoisted(() => [] as Array<Record<string, unknown>>);
vi.mock("../src/LimitLine", async (original) => {
  const real = await original<typeof import("../src/LimitLine")>();
  return {
    ...real,
    LimitLine: (props: Record<string, unknown>) => {
      passed.push(props);
      return null;
    },
  };
});

const controlLabels = () =>
  passed.filter((p) => p.role === "control").map((p) => p.label);

interface Point {
  n: number;
  value: number;
}

/* Twenty calm values and one outlier, so that rule 1 fires and the scatter of
   violations has something to show. */
const DATA: Point[] = [
  ...Array.from({ length: 20 }, (_, n) => ({ n, value: 10 + ((n % 3) - 1) * 0.05 })),
  { n: 20, value: 20 },
];
const ORIGIN = { kind: "given", center: 10, sigma: 0.1 } as const;

let teardown: (() => Promise<void>) | null = null;

afterEach(async () => {
  await teardown?.();
  teardown = null;
  passed.length = 0;
  vi.restoreAllMocks();
});

async function render(content: ReactNode): Promise<HTMLElement> {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => {
    root.render(
      <Chart data={DATA} ariaLabel="Control chart" height={240}>
        <XAxis accessor={(d: Point) => d.n} />
        <YAxis accessor={(d: Point) => d.value} />
        {content}
        <Legend placement="top" />
      </Chart>,
    );
  });
  // The scene publishes its state inside the rAF - wait one frame.
  await act(async () => {
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
  });
  teardown = async () => {
    await act(async () => root.unmount());
    host.remove();
  };
  return host;
}

const legend = (host: HTMLElement) =>
  [...host.querySelectorAll(".uc-legend-item")].map((e) => e.textContent ?? "");

describe("ControlChart - no text brought along", () => {
  it("does not label the control limits without a value", async () => {
    await render(
      <ControlChart accessor={(d: Point) => d.value} data={DATA} origin={ORIGIN} name="Feature" />,
    );
    const labels = controlLabels();
    expect(labels.length).toBeGreaterThan(0);
    expect(labels.every((label) => label === undefined)).toBe(true);
  });

  it("labels them when the caller names them", async () => {
    await render(
      <ControlChart
        accessor={(d: Point) => d.value}
        data={DATA}
        origin={ORIGIN}
        name="Feature"
        labelUpper="UCL"
        labelLower="LCL"
      />,
    );
    expect(controlLabels()).toContain("UCL");
    expect(controlLabels()).toContain("LCL");
  });

  it("appends no invented suffix to the name of the violations", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const host = await render(
      <ControlChart accessor={(d: Point) => d.value} data={DATA} origin={ORIGIN} name="Feature" />,
    );
    expect(legend(host).some((name) => name.includes("violation"))).toBe(false);
  });

  it("names the violations the way the caller names them", async () => {
    const host = await render(
      <ControlChart
        accessor={(d: Point) => d.value}
        data={DATA}
        origin={ORIGIN}
        name="Feature"
        violationName="Feature out of control"
      />,
    );
    expect(legend(host)).toEqual(["Feature", "Feature out of control"]);
  });
});
