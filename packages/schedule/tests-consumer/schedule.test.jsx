/* What an application's test does with the installed package: it renders a schedule the way a user
   sees it and reads the DOM. check:dist runs this file under Vitest and under Jest, in a project
   that has only the lines core's and charts' READMEs give. `React` is imported because Vite's own
   transform of a .jsx file is the classic one. */

import React from "react";
import { render, screen } from "@testing-library/react";
import { useSchedule } from "@umriss-ui/schedule";

const at = (h) => new Date(2026, 2, 17, h).getTime();
const TASKS = [{ id: "a-2041", color: "#2563eb" }];
const SUBTASKS = [{ id: "cut", task: "a-2041", lane: "saw", from: at(6), to: at(7) }];

function Plan() {
  const { Schedule, Lane, Subtasks } = useSchedule({ initialView: { domain: [at(5), at(12)] } });
  return (
    <Schedule ariaLabel="Plan of Tuesday">
      <Lane id="saw" label="Saw" />
      <Subtasks data={SUBTASKS} tasks={TASKS} />
    </Schedule>
  );
}

it("draws a lane with a bar and describes it", async () => {
  render(<Plan />);
  expect(await screen.findByText("Saw")).toBeTruthy();

  const plot = await screen.findByRole("application", { name: "Plan of Tuesday" });
  const summary = document.getElementById(plot.getAttribute("aria-describedby")).textContent;
  expect(summary).toContain("1 lane, 1 subtask in view");
});
