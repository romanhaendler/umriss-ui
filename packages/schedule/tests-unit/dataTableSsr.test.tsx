// @vitest-environment node
/* The data table's key on a server: in the markup, closed. */

import { expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { useSchedule } from "../src";

function Plan() {
  const { Schedule, Lane, DataTable } = useSchedule();
  return (
    <Schedule aria-label="Production plan">
      <Lane id="press" />
      <DataTable />
    </Schedule>
  );
}

it("renders the key closed", () => {
  const html = renderToString(<Plan />);
  expect(html).toMatch(/<button[^>]*aria-expanded="false"[^>]*>Show data<\/button>/);
  expect(html).not.toContain("<table");
});
