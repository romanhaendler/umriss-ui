/* A waterfall on a phone: seven category names in 290 px. Every category keeps a label - two lines, then cut
   short with an ellipsis - before any is left out. */

import { describe, expect, it } from "vitest";
import { CLASS_TICK, apart, computeLayout, shortened } from "../src/layout";

const names = ["Start", "New customers", "Upsell", "Churn", "Price cut", "Renewals", "End"];

const measure = (text: string, className: string) => ({
  width: Math.max(...text.split("\n").map((l) => l.length)) * 7,
  height: className === CLASS_TICK ? 14 : 16,
});

describe("category names that do not fit", () => {
  it("every category keeps a label that stands apart from its neighbours", () => {
    const layout = computeLayout({
      width: 300,
      height: 300,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      axes: [
        {
          key: "x:x",
          id: "x",
          orientation: "x",
          position: "bottom",
          grid: false,
          extent: [-0.4, 6.4],
          domainMode: "nice",
          tickValues: names.map((_, i) => i),
          tickFormat: (v: number) => names[v] ?? "",
        },
      ],
      measure,
      hysteresis: new Map(),
    });
    const ticks = layout.axes[0]!.ticks;
    expect(ticks).toHaveLength(names.length);
    expect(apart(ticks)).toBe(true);
    expect(ticks.map((t) => t.label)).toEqual(["Start", "New\ncust…", "Upse…", "Churn", "Price\ncut", "Rene…", "End"]);
  });

  it("shortened cuts each line and leaves a short one", () => {
    const w = (t: string) => t.length * 7;
    expect(shortened("Customers\nok", 30, w)).toBe("Cus…\nok");
  });
});
