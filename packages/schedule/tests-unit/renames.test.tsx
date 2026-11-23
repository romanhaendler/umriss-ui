/* The names a rename left behind keep working for a minor and warn once; where
   both the old and the new are given, the new one wins. A warning is once per
   name for the life of the module, so each name is read in one test only. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { useSchedule, violatedDependencies, type Dependency, type Subtask } from "../src";
import { resolveAppearance } from "../src/appearance";

const at = (hour: number) => new Date(2026, 2, 17, hour).getTime();
const sub = (id: string, from: number, to: number): Subtask => ({ id, task: "t", lane: "l", from: at(from), to: at(to) });
const SUBTASKS = [sub("a", 8, 10), sub("b", 10, 12)];

const warnings = () => vi.spyOn(console, "warn").mockImplementation(() => {});
const textOf = (warn: ReturnType<typeof warnings>) => warn.mock.calls.map((c) => c[0]).join("\n");
afterEach(() => vi.restoreAllMocks());

describe("a dependency's predecessor and successor", () => {
  it("reads from and to as it did, and warns once for each", () => {
    const warn = warnings();
    const old: Dependency = { id: "d", from: "b", to: "a", lag: 0 };
    const named: Dependency = { id: "d", predecessor: "b", successor: "a", lag: 0 };
    expect(violatedDependencies(SUBTASKS, [old])).toEqual(violatedDependencies(SUBTASKS, [named]));
    violatedDependencies(SUBTASKS, [old]);
    expect(warn.mock.calls.filter((c) => String(c[0]).includes("Dependency.from"))).toHaveLength(1);
    expect(textOf(warn)).toContain("Dependency.predecessor");
    expect(textOf(warn)).toContain("Dependency.successor");
  });

  it("takes the new name where both are given", () => {
    const both = { id: "d", predecessor: "a", successor: "b", from: "b", to: "a", lag: 0 } satisfies Dependency;
    expect(violatedDependencies(SUBTASKS, [both])).toEqual([]);
    expect(violatedDependencies(SUBTASKS, [{ ...both, predecessor: "b", successor: "a" }]).map((v) => v.dependency)).toEqual(["d"]);
  });
});

describe("the resolved appearance", () => {
  it("answers to dashed and hatched, and warns", () => {
    const warn = warnings();
    const look = resolveAppearance(["provisional"]);
    expect(look.provisional).toBe(true);
    expect(look.dashed).toBe(true);
    expect(look.hatched).toBe(false);
    expect(textOf(warn)).toContain("ResolvedAppearance.provisional");
    expect(textOf(warn)).toContain("ResolvedAppearance.fixed");
  });
});

describe("the schedule's barLabel and endMarks", () => {
  function Plan(props: { barLabel?: (s: Subtask) => string; label?: (s: Subtask) => string; endMarks?: "dot" | "none"; ends?: "dot" | "none" }) {
    const { Schedule, Lane, Subtasks } = useSchedule({ initialView: { domain: [at(6), at(14)] } });
    return (
      <Schedule aria-label="Plan" {...props}>
        <Lane id="l" label="l" />
        <Subtasks data={SUBTASKS} tasks={[{ id: "t", color: "red" }]} />
      </Schedule>
    );
  }

  it("warns once of label and of ends", () => {
    const warn = warnings();
    render(<Plan label={(s) => s.id} ends="none" />);
    render(<Plan label={(s) => s.id} ends="none" />);
    expect(warn.mock.calls.filter((c) => String(c[0]).includes("Schedule label"))).toHaveLength(1);
    expect(warn.mock.calls.filter((c) => String(c[0]).includes("Schedule ends"))).toHaveLength(1);
  });

  it("is quiet with the new names", () => {
    const warn = warnings();
    render(<Plan barLabel={(s) => s.id} endMarks="dot" />);
    expect(textOf(warn)).not.toContain("deprecated");
  });
});

describe("the name of a schedule", () => {
  it("is given by aria-labelledby alone", () => {
    function Named() {
      const { Schedule, Lane } = useSchedule({ initialView: { domain: [at(6), at(14)] } });
      return (
        <>
          <h2 id="plan-title">Plan of the week</h2>
          <Schedule aria-labelledby="plan-title">
            <Lane id="l" label="l" />
          </Schedule>
        </>
      );
    }
    const { container } = render(<Named />);
    expect(container.querySelector('[aria-labelledby="plan-title"]')).not.toBeNull();
  });
});
