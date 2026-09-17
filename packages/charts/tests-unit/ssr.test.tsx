/* SSR test (R-7.4): importing the module in Node and rendering a Chart with
   renderToString must not throw - canvas access happens only inside effects. */

import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { Chart } from "../src";

describe("SSR", () => {
  it("renderToString does not throw and yields the container plus the layers", () => {
    const html = renderToString(
      <Chart data={[]} ariaLabel="SSR test" height={200} />,
    );
    expect(html).toContain("uc-root");
    expect(html).toContain("uc-layer-series");
    expect(html).toContain("uc-layer-overlay");
    expect(html).toContain('role="img"');
  });
});
