// @vitest-environment jsdom

/* Zoom and pan, example 06 (follow the live edge): the chart follows the
   newest reading while the clock runs. What a reader sees is the stretch the
   plot is described by. A wheel zoom stops the following; the stretch stays
   while readings arrive; "Live" brings it back to the edge. The clock is the
   example's own, driven here by fake timers. */

import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FollowTheLiveEdge from "../demo/examples/Zoom-and-pan/06-follow-the-live-edge";
import { frame, plotOf, renderChart, sizePlot } from "./renderChart";

const SECOND = 1_000;
const START = new Date(2026, 2, 17, 10, 30).getTime();

let unmount: (() => void) | null = null;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
  vi.setSystemTime(START);
  // Frames come from real timers; the clock faked here is the example's.
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 0));
  sizePlot();
});

afterEach(() => {
  unmount?.();
  unmount = null;
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const real = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** The clock runs `seconds` on, then the chart's summary is written. */
async function runClock(seconds: number): Promise<void> {
  await act(async () => {
    vi.advanceTimersByTime(seconds * SECOND);
  });
  await act(async () => {
    await real(150);
  });
  await frame();
}

/** The end of the stretch shown, as the plot's summary writes it. */
const stretchEnd = (host: HTMLElement) => /From (.+?) to (.+?)\./.exec(host.textContent ?? "")?.[2] ?? "";

/** The one button of the example: "Pause" while following, "Live" while not. */
const followButton = (host: HTMLElement) =>
  [...host.querySelectorAll("button")].find((b) => b.textContent === "Pause" || b.textContent === "Live");

async function wheelZoom(host: HTMLElement): Promise<void> {
  const event = new WheelEvent("wheel", { ctrlKey: true, deltaY: -120, bubbles: true, cancelable: true });
  Object.defineProperty(event, "offsetX", { value: 200 });
  await act(async () => {
    plotOf(host).dispatchEvent(event);
  });
  await act(async () => {
    await real(150);
  });
  await frame();
}

describe("Follow the live edge", () => {
  it("moves the end of the stretch with the clock", async () => {
    const r = await renderChart(<FollowTheLiveEdge />);
    unmount = r.unmount;
    await runClock(0);
    expect(stretchEnd(r.host)).toBe("17 Mar 10:30");
    await runClock(90);
    expect(stretchEnd(r.host)).toBe("17 Mar 10:31");
    expect(followButton(r.host)?.textContent).toBe("Pause");
  });

  it("a wheel zoom stops the following, and the stretch stays while readings arrive", async () => {
    const r = await renderChart(<FollowTheLiveEdge />);
    unmount = r.unmount;
    await runClock(90);
    await wheelZoom(r.host);
    expect(followButton(r.host)?.textContent).toBe("Live");
    const stopped = stretchEnd(r.host);
    await runClock(120);
    expect(stretchEnd(r.host)).toBe(stopped);
    expect(followButton(r.host)?.textContent).toBe("Live");
  });

  it("Live brings the stretch back to the edge and resumes the following", async () => {
    const r = await renderChart(<FollowTheLiveEdge />);
    unmount = r.unmount;
    await runClock(90);
    await wheelZoom(r.host);
    await runClock(120);
    await act(async () => {
      followButton(r.host)?.click();
    });
    await runClock(0);
    expect(stretchEnd(r.host)).toBe("17 Mar 10:33");
    expect(followButton(r.host)?.textContent).toBe("Pause");
    await runClock(60);
    expect(stretchEnd(r.host)).toBe("17 Mar 10:34");
  });

  it("Pause stops the following", async () => {
    const r = await renderChart(<FollowTheLiveEdge />);
    unmount = r.unmount;
    await act(async () => {
      followButton(r.host)?.click();
    });
    await runClock(0);
    const paused = stretchEnd(r.host);
    expect(followButton(r.host)?.textContent).toBe("Live");
    await runClock(120);
    expect(stretchEnd(r.host)).toBe(paused);
  });
});
