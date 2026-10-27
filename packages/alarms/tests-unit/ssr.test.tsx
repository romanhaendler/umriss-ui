// @vitest-environment node
/* An alarm list rendered on a server: no layout engine, the rows already on the markup. */

import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { AlarmList, alarmModel } from "../src";

const T = Date.UTC(2026, 2, 17, 10, 30);
const projection = () =>
  alarmModel({
    alarms: [{ id: "a1", type: "temp", raised: T - 60_000, lifecycle: "active-unacknowledged" }],
    types: [{ id: "temp", label: "Furnace temperature", priority: "high" }],
    asOf: T,
  });

describe("an alarm list on a server", () => {
  it("renders the alarm and the count", () => {
    const html = renderToString(<AlarmList view={projection()} />);
    expect(html).toContain("Furnace temperature");
    expect(html).toContain("1 active alarm, unacknowledged");
  });

  it("renders the same markup twice", () => {
    expect(renderToString(<AlarmList view={projection()} />)).toBe(renderToString(<AlarmList view={projection()} />));
  });
});
