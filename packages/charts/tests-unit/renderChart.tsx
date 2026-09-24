/* Mounting a chart in jsdom for the keyboard and wording tests (charts-a11y).
   jsdom lays nothing out, so the plot gets a size of its own, and a frame is
   waited for so that the first layout has run. */

import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { vi } from "vitest";

const rect = (width: number, height: number) =>
  ({ x: 0, y: 0, top: 0, left: 0, right: width, bottom: height, width, height, toJSON: () => ({}) }) as DOMRect;

export function sizePlot(width = 400, height = 300): void {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    return this.classList.contains("uc-plot") ? rect(width, height) : rect(0, 0);
  });
}

export const frame = () =>
  act(async () => {
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
  });

export async function renderChart(element: ReactNode): Promise<{ host: HTMLElement; rerender: (e: ReactNode) => Promise<void>; unmount: () => void }> {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => root.render(element));
  await frame();
  return {
    host,
    rerender: async (e) => {
      await act(async () => root.render(e));
      await frame();
    },
    unmount: () => {
      act(() => root.unmount());
      host.remove();
    },
  };
}
