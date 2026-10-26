// @vitest-environment jsdom

/* The pen trend example: unchecking a pen hides its series and the hook's
   `hidden` names it; checking it shows it again. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import Pens from "../demo/examples/Axis/11-a-trend-with-pens";
import { frame, renderChart, sizePlot } from "./renderChart";

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot());
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

const box = (host: HTMLElement, name: string) =>
  [...host.querySelectorAll<HTMLInputElement>("input[type=checkbox]")].find((i) => i.closest("label")?.textContent?.includes(name)) as HTMLInputElement;
const hidden = (host: HTMLElement) => host.querySelector("[data-role=hidden]")?.textContent;

describe("The pen trend example", () => {
  it("hides a pen when it is unchecked and shows it when it is checked again", async () => {
    const r = await renderChart(<Pens />);
    unmount = r.unmount;
    expect(box(r.host, "Steam pressure").checked).toBe(true);
    expect(hidden(r.host)).toBe("");
    await act(async () => box(r.host, "Steam pressure").click());
    await frame();
    expect(box(r.host, "Steam pressure").checked).toBe(false);
    expect(hidden(r.host)).toBe("Steam pressure");
    await act(async () => box(r.host, "Steam pressure").click());
    await frame();
    expect(box(r.host, "Steam pressure").checked).toBe(true);
    expect(hidden(r.host)).toBe("");
  });

  it("hides yesterday's course with its pen", async () => {
    const r = await renderChart(<Pens />);
    unmount = r.unmount;
    await act(async () => box(r.host, "Furnace temperature").click());
    await frame();
    expect(hidden(r.host)).toBe("Furnace temperature, Furnace temperature, yesterday");
  });
});
