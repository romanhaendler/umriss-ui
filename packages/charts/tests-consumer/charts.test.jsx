/* What an application's test does with the installed package: it renders a chart the way a user
   sees it and reads the DOM. check:dist runs this file under Vitest and under Jest, in a project
   that has only the lines charts' README gives. `React` is imported because Vite's own transform
   of a .jsx file is the classic one. */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ChartsWordingProvider, DataTable, Legend, useChart } from "@umriss-ui/charts";
import { GERMAN_CHARTS_WORDING } from "@umriss-ui/charts/wording/de";

const ROWS = [
  { t: 0, a: 12, b: 3 },
  { t: 1, a: 18, b: 5 },
  { t: 2, a: 15, b: 4 },
];

function Course() {
  const { Chart, XAxis, YAxis, Line } = useChart(ROWS);
  return (
    <Chart height={280} aria-label="Course">
      <XAxis value="t" label="Index" />
      <YAxis />
      <Line value="a" name="Series A" />
      <Line value="b" name="Series B" />
      <Legend />
      <DataTable />
    </Chart>
  );
}

it("hides a series from the legend and lists the values in a table", async () => {
  render(<Course />);

  fireEvent.click(await screen.findByRole("button", { name: "Series A", pressed: true }));
  expect(await screen.findByRole("button", { name: "Series A", pressed: false })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Series B", pressed: true })).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "Show data" }));
  expect(await screen.findAllByRole("row")).toHaveLength(ROWS.length + 1);
  expect(screen.queryByRole("columnheader", { name: "Series A" })).toBeNull();
  expect(screen.getByRole("columnheader", { name: "Series B" })).toBeTruthy();
});

it("takes its wording from the provider the package exports", async () => {
  render(
    <ChartsWordingProvider wording={GERMAN_CHARTS_WORDING}>
      <Course />
    </ChartsWordingProvider>,
  );
  expect(await screen.findByRole("button", { name: "Daten zeigen" })).toBeTruthy();
});
