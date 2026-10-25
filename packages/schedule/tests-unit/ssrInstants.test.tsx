// @vitest-environment node
/* The schedule's server markup holds no formatted instant: the reader's zone
   is known only in the browser. */

import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { useSchedule } from "../src";

const at = (hour: number) => new Date(2026, 2, 17, hour).getTime();

function Plan() {
  const { Schedule, Lane } = useSchedule({ initialView: { domain: [at(6), at(14)] } });
  return (
    <Schedule ariaLabel="Production plan" now={at(9)}>
      <Lane id="press" label="Press" />
    </Schedule>
  );
}

describe("the schedule on a server", () => {
  it("writes no date or time", () => {
    expect(renderToString(<Plan />)).not.toMatch(/\d\d\/\d\d|\d\d:\d\d/);
  });
});
