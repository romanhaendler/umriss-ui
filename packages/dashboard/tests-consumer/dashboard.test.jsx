/* What an application's test does with the installed package: it renders a dashboard the way a
   user sees it and reads the DOM. check:dist runs this file under Vitest and under Jest, in a
   project that has only the lines core's README gives. `React` is imported because Vite's own
   transform of a .jsx file is the classic one. */

import React from "react";
import { render, screen } from "@testing-library/react";
import { useDashboard } from "@umriss-ui/dashboard";

function Dispatch() {
  const { Dashboard, WidgetType } = useDashboard({
    defaultView: { widgets: [{ id: "a", type: "figure", size: "small", options: { name: "Orders" } }] },
  });
  return (
    <Dashboard aria-label="Dispatch, today">
      <WidgetType
        name="figure"
        label="Figure"
        sentence="One number."
        sizes={{ small: { columns: 3, rows: 3 } }}
        start="small"
        defaultOptions={{ name: "Orders" }}
      >
        {({ options }) => <p>{options.name}: 1284</p>}
      </WidgetType>
    </Dashboard>
  );
}

it("shows a widget under its title", async () => {
  render(<Dispatch />);
  expect(await screen.findByRole("heading", { name: "Figure" })).toBeTruthy();
  expect(screen.getByText("Orders: 1284")).toBeTruthy();
});
