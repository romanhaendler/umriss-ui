// @vitest-environment node
/* The schedule rendered on a server (platform-claims-proved 02): the canvas is
   there and empty - nothing may touch `getContext` before an effect. */

import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { useSchedule } from "../src";
import type { Milestone, Subtask } from "../src";

const at = (hour: number) => new Date(2026, 2, 17, hour).getTime();
const WORK: Subtask[] = [
  { id: "c", task: "o1", lane: "press", from: at(8), to: at(10), name: "Cutting" },
  { id: "p", task: "o1", lane: "paint", from: at(11), to: at(12), name: "Painting" },
];
const MILESTONES: Milestone[] = [{ id: "m", lane: "press", at: at(12), label: "Release" }];

function Plan({ now }: { now: boolean | number }) {
  const { Schedule, Lane, Subtasks, Milestones } = useSchedule({ initialView: { domain: [at(6), at(14)] } });
  return (
    <Schedule ariaLabel="Production plan" now={now}>
      <Lane id="press" label="Press" />
      <Lane id="paint" label="Paint shop" />
      <Subtasks data={WORK} tasks={[{ id: "o1", color: "red", name: "Order 1" }]} />
      <Milestones data={MILESTONES} />
    </Schedule>
  );
}

describe("the schedule on a server", () => {
  it("renders the label around an empty canvas", () => {
    const html = renderToString(<Plan now={at(9)} />);
    expect(html).toContain("Production plan");
    expect(html).toMatch(/<canvas[^>]*><\/canvas>/);
  });

  /* Deliberate, not a gap: lanes and subtasks register in an effect, so a server
     renders the labelled frame and the empty canvas, and the lane labels and the
     summary's counts arrive on the client after mount. */
  it("renders no lane label on a server - the lanes arrive on the client, after mount", () => {
    const html = renderToString(<Plan now={at(9)} />);
    for (const text of ["Press", "Paint shop", "Cutting"]) expect(html).not.toContain(text);
    expect(html).toContain("0 lanes, 0 subtasks");
  });

  it("renders with now following the clock", () => {
    const html = renderToString(<Plan now />);
    expect(html).toContain("Production plan");
    expect(html).toMatch(/<canvas[^>]*><\/canvas>/);
  });

  it("renders the same markup twice", () => {
    expect(renderToString(<Plan now={at(9)} />)).toBe(renderToString(<Plan now={at(9)} />));
    expect(renderToString(<Plan now />)).toBe(renderToString(<Plan now />));
  });
});
