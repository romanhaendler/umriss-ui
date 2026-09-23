/* What <LimitLine> and <LimitBand> register (charts-fixes 08).

   A limit on the x axis without an `axisId` looked for the y axis "y" on the
   x side, found nothing and drew nothing. Its default axis is now the one its
   orientation names. The registration is caught at the hook, so the test needs
   no chart around it. */

import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LimitBand, LimitLine } from "../src/LimitLine";
import type { LimitConfig } from "../src/types";

const registered = vi.hoisted(() => [] as LimitConfig[]);
vi.mock("../src/context", () => ({
  useLimit: (_name: string, config: LimitConfig) => {
    registered.push(config);
  },
}));

describe("LimitLine and LimitBand - the default axis", () => {
  it("binds a limit on the x axis to the x axis", () => {
    registered.length = 0;
    renderToStaticMarkup(
      <>
        <LimitLine value={5} orientation="x" />
        <LimitBand from={1} to={2} orientation="x" />
        <LimitLine value={90} />
      </>,
    );
    expect(registered.map((c) => c.axisId)).toEqual(["x", "x", "y"]);
  });
});
