/* Pareto: sort, accumulate, find the cutoff crossing, collect the tail. Pure
   arithmetic, tested directly - the categories are indices on the numeric x axis
   (ADR-0002), and axes do not appear here. */

import { describe, expect, it } from "vitest";
import { pareto, defaultOptions } from "../src/pareto";

function items(...pairs: [string, number][]) {
  return pairs.map(([name, value]) => ({ name, value }));
}

describe("pareto - sorting", () => {
  it("sorts descending by value", () => {
    const { entries } = pareto(items(["a", 5], ["b", 9], ["c", 7]));
    expect(entries.map((e) => e.name)).toEqual(["b", "c", "a"]);
    expect(entries.map((e) => e.value)).toEqual([9, 7, 5]);
  });

  it("keeps ties in the input order", () => {
    // Two reasons with the same count must not swap places between two frames.
    const { entries } = pareto(
      items(["a", 5], ["b", 7], ["c", 5], ["d", 5], ["e", 9]),
    );
    expect(entries.map((e) => e.name)).toEqual(["e", "b", "a", "c", "d"]);
  });

  it("numbers the entries as categories: category n lies at x = n", () => {
    const { entries } = pareto(items(["a", 1], ["b", 2], ["c", 3]));
    expect(entries.map((e) => e.index)).toEqual([0, 1, 2]);
  });
});

describe("pareto - shares and accumulation", () => {
  it("computes the share and the cumulative share", () => {
    // By hand: total 100 → 0.5; 0.3; 0.2 and cumulative 0.5; 0.8; 1.
    const { entries, total } = pareto(items(["a", 50], ["b", 30], ["c", 20]));
    expect(total).toBe(100);
    expect(entries.map((e) => e.share)).toEqual([0.5, 0.3, 0.2]);
    expect(entries.map((e) => e.cumulative)).toEqual([0.5, 0.8, 1]);
  });

  it("reaches exactly one hundred per cent at the last entry", () => {
    const { entries } = pareto(items(["a", 1], ["b", 1], ["c", 1]));
    expect(entries[2]?.cumulative).toBe(1);
  });

  it("reaches exactly one hundred per cent after collecting the tail too", () => {
    const { entries } = pareto(
      items(["a", 1], ["b", 1], ["c", 1], ["d", 1], ["e", 1], ["f", 1], ["g", 1]),
      { collectRank: 2, remainderName: "Other" },
    );
    expect(entries[entries.length - 1]?.cumulative).toBe(1);
  });

  it("yields shares of zero for nothing but zeros, instead of numbers out of nowhere", () => {
    const result = pareto(items(["a", 0], ["b", 0]));
    expect(result.total).toBe(0);
    expect(result.entries.map((e) => e.share)).toEqual([0, 0]);
    expect(result.entries.map((e) => e.cumulative)).toEqual([0, 0]);
    expect(result.cutoffIndex).toBe(-1);
  });

  it("yields nothing for no input", () => {
    expect(pareto([])).toEqual({ entries: [], total: 0, cutoffIndex: -1 });
  });
});

describe("pareto - the cutoff crossing", () => {
  it("finds the entry at which the cutoff is crossed between two of them", () => {
    // 0.6; 0.9; 1 - the cutoff 0.8 lies between the first and the second.
    expect(pareto(items(["a", 60], ["b", 30], ["c", 10])).cutoffIndex).toBe(1);
  });

  it("counts the entry that lands exactly on the cutoff as the crossing", () => {
    // 0.5; 0.8; 1. A Pareto answers "which reasons make up eighty per cent" -
    // whoever reaches eighty exactly belongs to them.
    expect(pareto(items(["a", 50], ["b", 30], ["c", 20])).cutoffIndex).toBe(1);
  });

  it("reports -1 when the cutoff is never reached", () => {
    expect(
      pareto(items(["a", 50], ["b", 50]), { cutoff: 1.2 }).cutoffIndex,
    ).toBe(-1);
  });

  it("takes the cutoff as a parameter", () => {
    // A works that speaks of ninety per cent is not forced to eighty.
    const values = items(["a", 60], ["b", 30], ["c", 10]);
    expect(pareto(values, { cutoff: 0.9 }).cutoffIndex).toBe(1);
    expect(pareto(values, { cutoff: 0.95 }).cutoffIndex).toBe(2);
    expect(pareto(values, { cutoff: 0.5 }).cutoffIndex).toBe(0);
  });

  it("has 0.8 as the default", () => {
    const values = items(["a", 60], ["b", 30], ["c", 10]);
    expect(pareto(values).cutoffIndex).toBe(pareto(values, { cutoff: 0.8 }).cutoffIndex);
  });

  it("counts the collected remainder in like every other entry", () => {
    // Cumulative 0.7 and 1 - the remainder is the entry that takes the cutoff.
    const result = pareto(items(["a", 70], ["b", 20], ["c", 10]), { collectRank: 1, remainderName: "Other" });
    expect(result.cutoffIndex).toBe(1);
    expect(result.entries[1]?.remainder).toBe(true);
  });
});

/* library-audit 03: `remainderName` had "Sonstige" as its default - a German word
   in a package that has no text layer. Whoever collects names the remainder;
   whoever does not collect needs no name. */
describe("pareto - the name of the remainder comes from the caller", () => {
  const three = items(["a", 3], ["b", 2], ["c", 1]);

  it("has no default name", () => {
    expect("remainderName" in defaultOptions).toBe(false);
  });

  it("demands a name as soon as a collect rank is given", () => {
    // @ts-expect-error - a finite collect rank without remainderName is not a valid call
    expect(() => pareto(three, { collectRank: 1 })).toThrow(/remainderName/);
  });

  it("needs no name when nothing is collected", () => {
    expect(() => pareto(three)).not.toThrow();
    expect(() => pareto(three, { cutoff: 0.5 })).not.toThrow();
  });
});

describe("pareto - the collected remainder", () => {
  const many = items(
    ["a", 10],
    ["b", 8],
    ["c", 6],
    ["d", 4],
    ["e", 3],
    ["f", 2],
    ["g", 1],
  );

  it("gathers everything beyond the collect rank into one entry", () => {
    const { entries } = pareto(many, { collectRank: 3, remainderName: "Other" });
    expect(entries.map((e) => e.name)).toEqual(["a", "b", "c", "Other"]);
  });

  it("gives the remainder the total of what it replaces", () => {
    // By hand: 4 + 3 + 2 + 1 = 10.
    expect(pareto(many, { collectRank: 3, remainderName: "Other" }).entries[3]?.value).toBe(10);
  });

  it("puts the remainder at the end, even where it is larger than the entries before it", () => {
    // The remainder is, at 10, as large as the largest real reason. Sorted into
    // place, the chart would claim "Other" was the biggest problem.
    const { entries } = pareto(many, { collectRank: 3, remainderName: "Other" });
    const last = entries[entries.length - 1];
    expect(last?.remainder).toBe(true);
    expect(last?.value).toBe(10);
    expect(last?.index).toBe(3);
    expect(entries.filter((e) => e.remainder).length).toBe(1);
  });

  it("marks only the remainder as the remainder", () => {
    const { entries } = pareto(many, { collectRank: 3, remainderName: "Other" });
    expect(entries.map((e) => e.remainder)).toEqual([false, false, false, true]);
  });

  it("takes the name of the remainder as a parameter", () => {
    const { entries } = pareto(many, { collectRank: 2, remainderName: "Remaining" });
    expect(entries[2]?.name).toBe("Remaining");
  });

  it("yields no remainder at all at a collect rank beyond the count", () => {
    // Not an empty one - none at all.
    expect(pareto(many, { collectRank: 99, remainderName: "Other" }).entries.length).toBe(7);
    expect(pareto(many, { collectRank: 99, remainderName: "Other" }).entries.some((e) => e.remainder)).toBe(false);
    expect(pareto(many, { collectRank: 7, remainderName: "Other" }).entries.some((e) => e.remainder)).toBe(false);
  });

  it("collects nothing without a collect rank", () => {
    expect(pareto(many).entries.length).toBe(7);
    expect(pareto(many).entries.some((e) => e.remainder)).toBe(false);
  });

  it("collects a single remaining entry too", () => {
    // Beyond the rank is remainder, without a special case at exactly one.
    const { entries } = pareto(many, { collectRank: 6, remainderName: "Other" });
    expect(entries.length).toBe(7);
    expect(entries[6]).toMatchObject({ name: "Other", value: 1, remainder: true });
  });

  it("makes everything the remainder at a collect rank of zero", () => {
    const { entries } = pareto(many, { collectRank: 0, remainderName: "Other" });
    expect(entries.length).toBe(1);
    expect(entries[0]).toMatchObject({ name: "Other", value: 34, remainder: true });
  });
});
