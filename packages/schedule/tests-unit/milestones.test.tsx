/* What a caller sees of a milestone: the pointer's tooltip, the keys' walk and
   the readout, the summary's count, and a drag that never starts on it.
   The plot is laid out as in readout.test.tsx: 800 by 200 pixels, 06-14 h in
   view, so an hour is 100 pixels and the first lane's middle is at y 22. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import { LanguageProvider } from "@umriss-ui/core";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { useSchedule } from "../src";
import type { Intent, Milestone, Subtask } from "../src";

const at = (hour: number) => new Date(2026, 2, 17, hour).getTime();
const WORK: Subtask[] = [
  { id: "c", task: "o1", lane: "press", from: at(8), to: at(10), name: "Cutting" },
  { id: "p", task: "o1", lane: "paint", from: at(11), to: at(12), name: "Painting" },
];
const MILESTONES: Milestone[] = [
  { id: "m-release", lane: "press", at: at(12), label: "Release" },
  { id: "m-bare", lane: "paint", at: at(13) },
];

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0, y: 0, left: 0, top: 0, width: 800, height: 200, right: 800, bottom: 200, toJSON: () => ({}),
  });
});
afterEach(() => vi.restoreAllMocks());

function Plan({ onIntent, data = MILESTONES }: { onIntent?: (intent: Intent) => void; data?: Milestone[] }) {
  const { Schedule, Lane, Subtasks, Milestones } = useSchedule({ initialView: { domain: [at(6), at(14)] } });
  return (
    <Schedule aria-label="Plan" intents={["move"]} onIntent={onIntent}>
      <Lane id="press" label="Press" />
      <Lane id="paint" label="Paint shop" />
      <Subtasks data={WORK} tasks={[{ id: "o1", color: "red", name: "Order 1" }]} />
      <Milestones data={data} />
    </Schedule>
  );
}

const plotOf = (host: HTMLElement) => host.querySelector<HTMLElement>("[role='application']")!;
const readout = (host: HTMLElement) => host.querySelector("[aria-live='polite']")?.textContent ?? "";
const summary = (host: HTMLElement) => document.getElementById(plotOf(host).getAttribute("aria-describedby")!)?.textContent ?? "";
const tooltip = (host: HTMLElement) => host.querySelector("[role='tooltip']")?.textContent ?? null;
const rest = () => act(() => new Promise<void>((resolve) => setTimeout(resolve, 200)));

describe("the pointer", () => {
  it("names a milestone in the tooltip by label and time, and a bare one by its id", async () => {
    const { container } = render(<Plan />);
    fireEvent.pointerMove(plotOf(container), { clientX: 600, clientY: 22, pointerId: 1 });
    await rest();
    expect(tooltip(container)).toBe("Milestone: Release17/03 12:00");
    fireEvent.pointerMove(plotOf(container), { clientX: 700, clientY: 66, pointerId: 1 });
    await rest();
    expect(tooltip(container)).toBe("Milestone: m-bare17/03 13:00");
  });

  it("is on a milestone only at its mark", async () => {
    const { container } = render(<Plan />);
    fireEvent.pointerMove(plotOf(container), { clientX: 650, clientY: 22, pointerId: 1 });
    await rest();
    expect(tooltip(container)).toBeNull();
  });

  it("does not take the bar beneath a milestone along: a press on the mark moves nothing", () => {
    const onIntent = vi.fn();
    const stacked: Milestone[] = [{ id: "m", lane: "press", at: at(9), label: "Cut-off" }];
    const { container } = render(<Plan onIntent={onIntent} data={stacked} />);
    const plot = plotOf(container);
    fireEvent.pointerDown(plot, { clientX: 300, clientY: 22, pointerId: 1, button: 0, buttons: 1 });
    fireEvent.pointerMove(plot, { clientX: 400, clientY: 22, pointerId: 1, buttons: 1 });
    fireEvent.pointerUp(plot, { clientX: 400, clientY: 22, pointerId: 1 });
    expect(onIntent).not.toHaveBeenCalled();
  });
});

describe("the keys", () => {
  it("walk to a milestone in time order on its lane, and read its lane, kind, label and time", async () => {
    const { container } = render(<Plan />);
    fireEvent.keyDown(plotOf(container), { key: "Home" });
    fireEvent.keyDown(plotOf(container), { key: "ArrowRight" });
    await rest();
    expect(readout(container)).toBe("Press, Milestone: Release, 17/03 12:00");
    fireEvent.keyDown(plotOf(container), { key: "ArrowLeft" });
    await rest();
    expect(readout(container)).toMatch(/^Press, Order 1, Cutting/);
  });

  it("reach the milestone of a lane with no work on it, and read it in German under the German wording", async () => {
    const { container } = render(
      <LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>
        <Plan data={[{ id: "m", lane: "paint", at: at(7), label: "Abnahme" }]} />
      </LanguageProvider>,
    );
    fireEvent.keyDown(plotOf(container), { key: "End" });
    fireEvent.keyDown(plotOf(container), { key: "ArrowUp" });
    fireEvent.keyDown(plotOf(container), { key: "ArrowDown" });
    await rest();
    expect(readout(container)).toBe("Paint shop, Meilenstein: Abnahme, 17.03. 07:00");
  });

  it("propose nothing for a milestone: Alt with an arrow reports no intent", async () => {
    const onIntent = vi.fn();
    const { container } = render(<Plan onIntent={onIntent} />);
    fireEvent.keyDown(plotOf(container), { key: "Home" });
    fireEvent.keyDown(plotOf(container), { key: "ArrowRight" });
    fireEvent.keyDown(plotOf(container), { key: "ArrowRight", altKey: true });
    await rest();
    expect(onIntent).not.toHaveBeenCalled();
  });
});

describe("the summary", () => {
  it("is the same without milestones, and with them says how many - they make no finding and are no subtask", () => {
    const without = render(<Plan data={[]} />);
    const text = summary(without.container);
    without.unmount();
    expect(text).not.toMatch(/milestone/i);
    const { container } = render(<Plan />);
    expect(summary(container)).toMatch(/violated dependencies\. 2 milestones\. Left and right/);
    expect(summary(container).replace(" 2 milestones.", "")).toBe(text);
  });

  it("says one milestone in the singular, and in German", () => {
    const one = render(<Plan data={MILESTONES.slice(0, 1)} />);
    expect(summary(one.container)).toContain(" 1 milestone. ");
    one.unmount();
    const { container } = render(
      <LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>
        <Plan />
      </LanguageProvider>,
    );
    expect(summary(container)).toMatch(/verletzte Abhängigkeiten\. 2 Meilensteine\. Pfeil links/);
  });
});
