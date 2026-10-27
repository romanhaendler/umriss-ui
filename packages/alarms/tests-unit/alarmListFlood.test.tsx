/* The list under flood volume, driven by a host that ticks the as-of time once
   a second. What the operator holds - the focused control, the ticked rows -
   must survive every tick and every re-sort. jsdom has no layout, so the scroll
   position is the visual suite's. */

import { describe, expect, it } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { useTableSelection } from "@umriss-ui/table";
import { DEFAULT_WORDING } from "@umriss-ui/core";
import { AlarmList, alarmModel } from "../src";
import type { Alarm, AlarmType } from "../src";

const T0 = Date.UTC(2026, 2, 17, 10, 30, 0);
const SECOND = 1000;

function Host({ typesOf, alarmsAt, flood }: {
  typesOf: readonly AlarmType[];
  alarmsAt: (tick: number) => readonly Alarm[];
  flood?: { windowMs: number; atLeast: number };
}) {
  const [tick, setTick] = useState(0);
  const projection = alarmModel({ alarms: alarmsAt(tick), types: typesOf, asOf: T0 + tick * SECOND, flood });
  const selection = useTableSelection(projection.filtered.map((row) => row.id));
  return (
    <>
      <button onClick={() => setTick((n) => n + 1)}>tick</button>
      <AlarmList view={projection} selection={selection} onAcknowledge={() => {}} />
    </>
  );
}

const next = () => fireEvent.click(screen.getByRole("button", { name: "tick" }));

describe("first-out and the flood in the list", () => {
  it("shows the first-out and the first in the flood as words, and the time to the second", () => {
    const alarms: Alarm[] = Array.from({ length: 12 }, (_, i) => ({
      id: `t${i}`,
      type: "trip",
      group: "furnace",
      lifecycle: "active-unacknowledged" as const,
      raised: T0 - (i + 1) * SECOND,
    }));
    render(
      <AlarmList
        view={alarmModel({ alarms, types: [{ id: "trip", label: "Trip", priority: "high" }], asOf: T0, flood: { windowMs: 600_000, atLeast: 11 } })}
      />,
    );
    expect(screen.getAllByText(DEFAULT_WORDING.alarmFirstOut)).toHaveLength(1);
    expect(screen.getAllByText(DEFAULT_WORDING.alarmFirstInFlood)).toHaveLength(1);
    expect(screen.getAllByText(DEFAULT_WORDING.alarmFloodHint(12, 10)).length).toBeGreaterThan(0);
    // Every Raised cell carries seconds: ":ss" after the minutes.
    const cells = screen.getAllByRole("cell").map((cell) => cell.textContent ?? "");
    expect(cells.filter((text) => /\d{2}:\d{2}:\d{2}/.test(text))).toHaveLength(12);
  });
});

describe("500 arrivals over ten ticks", () => {
  const TYPES: AlarmType[] = [{ id: "a", label: "Arrival", priority: "medium" }];
  const alarmsAt = (tick: number): Alarm[] =>
    Array.from({ length: (tick + 1) * 50 }, (_, i) => ({
      id: `a${i}`,
      type: "a",
      lifecycle: "active-unacknowledged" as const,
      raised: T0 + Math.floor(i / 50) * SECOND,
    }));

  it("keeps 500 rows, marks the flood from the threshold's tick on and holds focus", () => {
    render(<Host typesOf={TYPES} alarmsAt={alarmsAt} flood={{ windowMs: 600_000, atLeast: 100 }} />);
    const held = screen.getAllByRole("checkbox")[3]!;
    held.focus();
    const label = held.getAttribute("aria-label");
    const heldRow = held.closest("tr");
    for (let tick = 0; tick < 10; tick += 1) {
      const marked = screen.queryAllByText(DEFAULT_WORDING.alarmFloodHint((tick + 1) * 50, 10)).length > 0;
      expect(marked, `tick ${tick}`).toBe(tick >= 1);
      expect(document.activeElement, `tick ${tick}`).not.toBe(document.body);
      expect(document.activeElement).toBe(held);
      if (tick < 9) next();
    }
    expect(screen.getAllByRole("row")).toHaveLength(501);
    expect(held.isConnected).toBe(true);
    expect(held.getAttribute("aria-label")).toBe(label);
    expect(held.closest("tr")).toBe(heldRow);
  }, 60_000);
});

describe("1,000 standing alarms of 100 types, updated every tick", () => {
  const TYPES: AlarmType[] = Array.from({ length: 100 }, (_, i) => ({ id: `ty${i}`, label: `Type ${i}`, priority: "low" as const }));
  /* Every tick a hundred alarms are raised anew and the rest are replaced by
     equal copies: the order changes and every object is new. */
  const alarmsAt = (tick: number): Alarm[] =>
    Array.from({ length: 1000 }, (_, i) => ({
      id: `s${i}`,
      type: `ty${i % 100}`,
      lifecycle: "active-unacknowledged" as const,
      raised: T0 - 3_600_000 + i * SECOND + (Math.floor(i / 100) === tick % 10 ? 4_000_000 : 0),
    }));

  it("holds focus and the selection across ten ticks", () => {
    render(<Host typesOf={TYPES} alarmsAt={alarmsAt} />);
    const boxes = screen.getAllByRole("checkbox");
    const [, one, two] = boxes;
    fireEvent.click(one!);
    fireEvent.click(two!);
    const held = boxes[5]!;
    held.focus();
    for (let tick = 0; tick < 10; tick += 1) {
      next();
      expect(document.activeElement, `tick ${tick}`).toBe(held);
      expect(one!.isConnected && (one as HTMLInputElement).checked).toBe(true);
      expect((two as HTMLInputElement).checked).toBe(true);
    }
    expect(screen.getAllByRole("row")).toHaveLength(1001);
  }, 120_000);
});
