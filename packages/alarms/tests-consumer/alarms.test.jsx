/* What an application's test does with the installed package: it renders an alarm list the way a
   user sees it and reads the DOM. check:dist runs this file under Vitest and under Jest, in a
   project that has only the lines core's README gives. `React` is imported because Vite's own
   transform of a .jsx file is the classic one. */

import React from "react";
import { render, screen } from "@testing-library/react";
import { AlarmList, alarmModel } from "@umriss-ui/alarms";

const NOW = Date.UTC(2026, 2, 17, 10, 30);

it("shows an alarm and says how many wait", () => {
  const view = alarmModel({
    alarms: [{ id: "a1", type: "temp", raised: NOW - 60_000, lifecycle: "active-unacknowledged" }],
    types: [{ id: "temp", label: "Furnace temperature", priority: "high" }],
    asOf: NOW,
  });
  render(<AlarmList view={view} />);
  expect(screen.getByText("Furnace temperature")).toBeTruthy();
  expect(screen.getByText("1 active alarm, unacknowledged")).toBeTruthy();
});
