/* A Stat's as-of time is a Date, a number of milliseconds or null. An ISO string
   reads as no connection, so it warns in development and names the shape. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { Stat } from "../src";

const ages = { stale: 300_000, lost: 900_000 };

afterEach(() => vi.restoreAllMocks());

function warnings(ui: React.ReactElement): string[] {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  render(ui);
  return warn.mock.calls.map((c) => String(c[0]));
}

describe("Stat asOf shape", () => {
  it("warns once for an ISO string and names the shape", () => {
    const iso = "2026-10-31T10:00:00Z" as unknown as Date;
    const w = warnings(<Stat label="L" value={3} asOf={iso} ages={ages} />);
    expect(w.filter((m) => /Stat asOf must be a Date, a number of milliseconds or null/.test(m))).toHaveLength(1);
  });

  it("stays quiet for a Date, a number, null and an absent asOf", () => {
    const w = warnings(
      <>
        <Stat label="A" value={3} asOf={new Date()} ages={ages} />
        <Stat label="B" value={3} asOf={Date.now()} ages={ages} />
        <Stat label="C" value={3} asOf={null} ages={ages} />
        <Stat label="D" value={3} />
      </>,
    );
    expect(w).toEqual([]);
  });
});
