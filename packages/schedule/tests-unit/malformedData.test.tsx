/* A schedule in development says what is wrong with the data it is given. A
   warning appears once per kind and id for the life of the module, so every
   test uses ids of its own. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { LanguageProvider } from "@umriss-ui/core";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { useSchedule } from "../src";
import type { BlockedTime, Dependency, Milestone, Subtask, Task } from "../src";

const at = (hour: number) => new Date(2026, 2, 17, hour).getTime();
const TASKS: Task[] = [{ id: "t", color: "red" }];
const sub = (id: string, over: Partial<Subtask> = {}): Subtask => ({ id, task: "t", lane: "l", from: at(8), to: at(10), ...over });

interface Data {
  subtasks?: Subtask[];
  tasks?: Task[];
  dependencies?: Dependency[];
  milestones?: Milestone[];
  blocked?: BlockedTime[];
  lanes?: string[];
  lanesLast?: boolean;
}

function Plan({ subtasks = [], tasks = TASKS, dependencies, milestones, blocked, lanes = ["l"], lanesLast = false }: Data) {
  const { Schedule, Lane, Subtasks, Dependencies, Milestones, BlockedTimes } = useSchedule({ initialView: { domain: [at(6), at(14)] } });
  const laneEls = lanes.map((id, i) => <Lane key={i} id={id} label={id} />);
  return (
    <Schedule aria-label="Plan">
      {!lanesLast && laneEls}
      <Subtasks data={subtasks} tasks={tasks} />
      {dependencies && <Dependencies data={dependencies} />}
      {milestones && <Milestones data={milestones} />}
      {blocked && <BlockedTimes data={blocked} />}
      {lanesLast && laneEls}
    </Schedule>
  );
}

const warnings = () => vi.spyOn(console, "warn").mockImplementation(() => {});
const textOf = (warn: ReturnType<typeof warnings>) => warn.mock.calls.map((c) => c[0]).join("\n");
afterEach(() => vi.restoreAllMocks());

describe("malformed data", () => {
  it("warns about a subtask that does not end after it starts, and about a NaN", () => {
    const warn = warnings();
    render(<Plan subtasks={[sub("rev1", { from: at(10), to: at(8) }), sub("zero1", { to: at(8) }), sub("nan1", { to: NaN })]} />);
    expect(warn).toHaveBeenCalledTimes(3);
    for (const word of ["rev1", "zero1", "nan1", "Milestone"]) expect(textOf(warn)).toContain(word);
  });

  it("warns about an item on a lane nobody declares", () => {
    const warn = warnings();
    render(
      <Plan
        subtasks={[sub("lost1", { lane: "ghost" })]}
        milestones={[{ id: "mlost1", lane: "ghost2", at: at(9) }]}
        blocked={[{ id: "blost1", lane: "ghost3", from: at(8), to: at(9) }]}
      />,
    );
    expect(warn).toHaveBeenCalledTimes(3);
    for (const word of ["lost1", "ghost", "mlost1", "ghost2", "blost1", "ghost3"]) expect(textOf(warn)).toContain(word);
  });

  it("warns about a subtask whose task is not among the tasks", () => {
    const warn = warnings();
    render(<Plan subtasks={[sub("notask1", { task: "nobody" })]} />);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(textOf(warn)).toMatch(/notask1.*nobody/);
  });

  it("warns about a dependency naming no subtask", () => {
    const warn = warnings();
    render(<Plan subtasks={[sub("dsub1")]} dependencies={[{ id: "dep1", from: "dsub1", to: "missing1", lag: 0 }]} />);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(textOf(warn)).toMatch(/dep1.*missing1/);
  });

  it("warns about an id that stands twice", () => {
    const warn = warnings();
    render(
      <Plan
        subtasks={[sub("twin1"), sub("twin1")]}
        dependencies={[
          { id: "dtwin1", from: "twin1", to: "twin1", lag: 0 },
          { id: "dtwin1", from: "twin1", to: "twin1", lag: 0 },
        ]}
        lanes={["ltwin1", "ltwin1", "l"]}
      />,
    );
    expect(warn).toHaveBeenCalledTimes(3);
    for (const word of ["twin1", "dtwin1", "ltwin1"]) expect(textOf(warn)).toContain(word);
  });

  it("does not warn again for the same plan re-rendered", () => {
    const warn = warnings();
    const data = [sub("again1", { to: at(7) })];
    const { rerender } = render(<Plan subtasks={data} />);
    rerender(<Plan subtasks={[...data]} />);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("is silent for a correct plan, a lane declared last, no lanes yet and no tasks", () => {
    const warn = warnings();
    render(<Plan subtasks={[sub("ok1"), sub("ok1b")]} dependencies={[{ id: "dok1", from: "ok1", to: "ok1b", lag: 0 }]} lanesLast />);
    render(<Plan subtasks={[sub("ok2"), sub("ok3", { lane: "later" })]} lanes={[]} tasks={[]} />);
    render(<Plan subtasks={[sub("ok4")]} tasks={[]} />);
    expect(warn).not.toHaveBeenCalled();
  });

  it("is silent for the README's order, Dependencies before Subtasks", () => {
    const warn = warnings();
    function Early() {
      const { Schedule, Lane, Subtasks, Dependencies } = useSchedule({ initialView: { domain: [at(6), at(14)] } });
      return (
        <Schedule aria-label="Plan">
          <Lane id="l" label="l" />
          <Dependencies data={[{ id: "dearly1", from: "early1", to: "early1b", lag: 0 }]} />
          <Subtasks data={[sub("early1"), sub("early1b")]} tasks={TASKS} />
        </Schedule>
      );
    }
    render(<Early />);
    expect(warn).not.toHaveBeenCalled();
  });

  it("names the plot after the label, in the wording's language", () => {
    const { container, unmount } = render(<Plan />);
    expect(container.firstElementChild!.getAttribute("aria-label")).toBe("Plan");
    expect(container.querySelector('[role="application"]')!.getAttribute("aria-label")).toBe("Plan, plot");
    unmount();
    const german = render(
      <LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>
        <Plan />
      </LanguageProvider>,
    );
    expect(german.container.querySelector('[role="application"]')!.getAttribute("aria-label")).toBe("Plan, Diagramm");
  });

  it("warns once about from and to that are not milliseconds", () => {
    const warn = warnings();
    const bad = (id: string, from: unknown, to: unknown) => sub(id, { from: from as number, to: to as number });
    render(
      <Plan
        subtasks={[
          bad("str1", "2026-03-17T08:00:00Z", "2026-03-17T10:00:00Z"),
          bad("date1", new Date(2026, 2, 17, 8), new Date(2026, 2, 17, 10)),
          bad("sec1", 1773734400, 1773741600),
        ]}
      />,
    );
    expect(warn).toHaveBeenCalledTimes(3);
    for (const word of ["str1", "date1", "sec1", "milliseconds"]) expect(textOf(warn)).toContain(word);
  });
});
