/* What a screen reader hears of a schedule (schedule-a11y 04): the plot's role
   and name, a summary it is described by, and a polite readout once the keys
   rest - never after the pointer. In English and in German. jsdom lays out
   nothing, so every element is given the plot's size: 800 by 200 pixels at the
   origin, eight hours across - an hour is 100 pixels. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import { LanguageProvider } from "@umriss-ui/core";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { Lane, Schedule, Subtasks, Transports } from "../src";
import type { Subtask } from "../src";

const at = (hour: number) => new Date(2026, 2, 17, hour).getTime();
const WORK: Subtask[] = [
  { id: "c", task: "o1", lane: "press", from: at(8), to: at(10), name: "Cutting" },
  { id: "w", task: "o2", lane: "press", from: at(9), to: at(11), name: "Welding" },
  { id: "p", task: "o1", lane: "paint", from: at(11), to: at(12), name: "Painting" },
];

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0, y: 0, left: 0, top: 0, width: 800, height: 200, right: 800, bottom: 200, toJSON: () => ({}),
  });
});
afterEach(() => vi.restoreAllMocks());

const plan = (
  <Schedule ariaLabel="Plan of week 12" initialDomain={[at(6), at(14)]}>
    <Lane id="press" label="Press" />
    <Lane id="paint" label="Paint shop" />
    <Transports data={[{ id: "t", from: "c", to: "p", duration: 5_400_000 }]} />
    <Subtasks data={WORK} tasks={[{ id: "o1", color: "red", name: "Order 1" }, { id: "o2", color: "blue", name: "Order 2" }]} />
  </Schedule>
);

const plotOf = (host: HTMLElement) => host.querySelector<HTMLElement>("[role='application']")!;
const readout = (host: HTMLElement) => host.querySelector("[aria-live='polite']")?.textContent ?? "";
const summary = (host: HTMLElement) => document.getElementById(plotOf(host).getAttribute("aria-describedby")!)?.textContent ?? "";
const rest = () => act(() => new Promise<void>((resolve) => setTimeout(resolve, 200)));

describe("the plot as a tab stop", () => {
  it("is one application with the schedule's name and role description", () => {
    const { container } = render(plan);
    const plot = plotOf(container);
    expect(plot.tabIndex).toBe(0);
    expect(plot.getAttribute("aria-label")).toBe("Plan of week 12");
    expect(plot.getAttribute("aria-roledescription")).toBe("schedule");
  });
});

describe("the readout", () => {
  it("reads lane, task, subtask, day and times and every finding by name, once the keys rest", async () => {
    const { container } = render(plan);
    fireEvent.keyDown(plotOf(container), { key: "ArrowRight" });
    fireEvent.keyDown(plotOf(container), { key: "ArrowRight" });
    expect(readout(container)).toBe("");
    await rest();
    expect(readout(container)).toBe("Press, Order 2, Welding, 17/03 09:00–11:00, Overlap with Cutting");
  });

  it("reads a transport reached by key, and a late one as late", async () => {
    const { container } = render(plan);
    fireEvent.keyDown(plotOf(container), { key: "ArrowRight" });
    fireEvent.keyDown(plotOf(container), { key: "]" });
    await rest();
    /* Cutting ends at 10:00, painting starts at 11:00: ninety minutes do not fit. */
    expect(readout(container)).toBe("Order 1, Transport 1 hrs 30 min, Cutting → Painting, Late transport, 30 min short");
  });

  it("stays silent for the pointer", async () => {
    const { container } = render(plan);
    /* Onto Cutting: x 200-400, first lane. */
    fireEvent.pointerMove(plotOf(container), { clientX: 250, clientY: 20, pointerId: 1 });
    await rest();
    expect(container.querySelector("[role='tooltip']")).not.toBeNull();
    expect(readout(container)).toBe("");
  });

  it("speaks German under the German wording and formats", async () => {
    const { container } = render(
      <LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>
        {plan}
      </LanguageProvider>,
    );
    expect(plotOf(container).getAttribute("aria-roledescription")).toBe("Belegungsplan");
    fireEvent.keyDown(plotOf(container), { key: "ArrowRight" });
    await rest();
    expect(readout(container)).toBe("Press, Order 1, Cutting, 17.03. 08:00–10:00, Überschneidung mit Welding, Transport verspätet, 30 Min zu knapp");
  });
});

describe("the summary", () => {
  it("describes the lanes, the subtasks in view, the span and the findings, then the keys", () => {
    const { container } = render(plan);
    const text = summary(container);
    expect(text).toMatch(/^2 lanes, 3 subtasks in view from 17\/03 06:00 to 17\/03 14:00\. 1 overlap, 1 late transport\. /);
    expect(text).toContain("Left and right arrows move along the lane");
  });

  it("is German under the German wording", () => {
    const { container } = render(
      <LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>
        {plan}
      </LanguageProvider>,
    );
    expect(summary(container)).toMatch(
      /^2 Bahnen, 3 Arbeitsgänge im Blick von 17\.03\. 06:00 bis 17\.03\. 14:00\. 1 Überschneidung, 1 verspäteter Transport\. Pfeil links/,
    );
  });
});
