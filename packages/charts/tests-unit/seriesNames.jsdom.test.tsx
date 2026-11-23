// @vitest-environment jsdom

/* A series is told apart by its name: two of one name, and a legend entry that cannot hide a series
   without one, each warn once in development. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { Legend, useChart } from "../src";

const ROWS = [{ t: 0, a: 1 }, { t: 1, a: 2 }];

function Host({ names }: { names: (string | undefined)[] }) {
  const { Chart, XAxis, YAxis, Line } = useChart(ROWS);
  return (
    <Chart aria-label="Names" height={200}>
      <XAxis value="t" />
      <YAxis />
      {names.map((name, i) => (
        <Line key={i} value="a" name={name} />
      ))}
      <Legend />
    </Chart>
  );
}

let cleanup: (() => void) | null = null;
afterEach(() => {
  cleanup?.();
  vi.restoreAllMocks();
});

async function warnings(names: (string | undefined)[]): Promise<string[]> {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => {
    root.render(<Host names={names} />);
  });
  await act(async () => {
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
  });
  cleanup = () => {
    act(() => root.unmount());
    host.remove();
  };
  return warn.mock.calls.map((c) => String(c[0]));
}

describe("a series is its name", () => {
  it("warns once for two series of one name", async () => {
    const said = (await warnings(["Twin", "Twin"])).filter((m) => m.includes('named "Twin"'));
    expect(said).toHaveLength(1);
  });

  it("warns once that a legend entry cannot hide a series without a name", async () => {
    const said = (await warnings([undefined, undefined])).filter((m) => m.includes("cannot hide it"));
    expect(said).toHaveLength(1);
  });
});
