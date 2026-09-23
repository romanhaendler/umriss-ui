// @vitest-environment jsdom

/* charts-essentials 04: the legend toggles only when the caller listens. With
   `onToggle` an entry is a button that names its series; without it the legend
   stays a legend, not a row of controls that do nothing. A hidden entry stays,
   drawn back. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { Chart, Legend, Line, XAxis, YAxis } from "../src";

interface Row {
  t: number;
  a: number;
  b: number;
}

const data: Row[] = [
  { t: 0, a: 1, b: 5 },
  { t: 1, a: 2, b: 6 },
];

let cleanup: (() => void) | null = null;
afterEach(() => {
  cleanup?.();
  cleanup = null;
});

async function render(onToggle?: (name: string) => void): Promise<HTMLElement> {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => {
    root.render(
      <Chart data={data} ariaLabel="Legend toggle" height={200}>
        <XAxis accessor={(d: Row) => d.t} />
        <YAxis accessor={(d: Row) => d.a} />
        <Line accessor={(d: Row) => d.a} name="A" />
        <Line accessor={(d: Row) => d.b} name="B" hidden />
        <Legend onToggle={onToggle} />
      </Chart>,
    );
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

describe("Legend onToggle", () => {
  it("leaves the legend without buttons when nobody listens", async () => {
    const host = await render();
    expect(host.querySelectorAll(".uc-legend-item")).toHaveLength(2);
    expect(host.querySelectorAll("button")).toHaveLength(0);
  });

  it("makes each entry a button that names its series", async () => {
    const onToggle = vi.fn();
    const host = await render(onToggle);
    const buttons = [...host.querySelectorAll<HTMLButtonElement>("button.uc-legend-item")];
    expect(buttons.map((b) => b.getAttribute("aria-pressed"))).toEqual(["true", "false"]);
    act(() => buttons[1]?.click());
    expect(onToggle).toHaveBeenCalledWith("B");
  });

  it("keeps a hidden entry, marked", async () => {
    const host = await render();
    const items = [...host.querySelectorAll(".uc-legend-item")];
    expect(items.map((i) => i.hasAttribute("data-hidden"))).toEqual([false, true]);
  });
});
