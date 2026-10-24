// @vitest-environment node
/* A dashboard rendered on a server: no layout engine, the places already on
   the markup. */

import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { useDashboard } from "../src";

function Start() {
  const { Dashboard, WidgetType } = useDashboard({
    defaultView: { widgets: [{ id: "a", type: "figure", size: "small", options: { name: "Orders" } }] },
  });
  return (
    <Dashboard aria-label="Start">
      <WidgetType name="figure" label="Figure" sentence="One." sizes={{ small: { columns: 3, rows: 2 } }} start="small" defaultOptions={{ name: "" }} title={(o) => o.name}>
        {({ options, size }) => <span>{`${options.name} ${size}`}</span>}
      </WidgetType>
    </Dashboard>
  );
}

describe("a dashboard on a server", () => {
  it("renders the frames with their title, content and place", () => {
    const html = renderToString(<Start />);
    expect(html).toContain("Orders small");
    expect(html).toContain("--_dashboard-column:1");
    expect(html).toContain('aria-label="Orders"');
  });

  it("renders the same markup twice", () => {
    expect(renderToString(<Start />)).toBe(renderToString(<Start />));
  });
});
