/* The typing, checked by the compiler (charts-bound-to-rows 08). This file does
   not run; it is compiled, as part of `typecheck`. Every line under
   `@ts-expect-error` MUST yield an error. */

// @ts-expect-error - the free Schedule is gone: it comes from useSchedule (ADR-0048).
import { Schedule } from "../src";
// @ts-expect-error - and so are its parts.
import { Lane } from "../src";
import { useSchedule } from "../src";

export function Parts() {
  const { Schedule: Plan, Lane: Row, Subtasks } = useSchedule();
  // @ts-expect-error - useSchedule binds no row type and takes no rows.
  useSchedule([]);
  return (
    <Plan ariaLabel="Plan">
      <Row id="a" />
      {/* @ts-expect-error - a subtask is the library's own type. */}
      <Subtasks data={[{ id: "x" }]} tasks={[]} />
      {/* @ts-expect-error - the span in view is the view's (ADR-0047): useSchedule({ initialView }). */}
      <Plan ariaLabel="Plan" initialDomain={[0, 1]} />
      {/* @ts-expect-error - and so are the folded groups: no controlled pair beside the view. */}
      <Plan ariaLabel="Plan" collapsedGroups={[]} />
    </Plan>
  );
}

export function View() {
  const { view, setDomain, toggleGroup } = useSchedule({ initialView: { domain: [0, 1], folded: ["hall"] }, onViewChange: (v) => v.folded });
  setDomain(null);
  toggleGroup("hall");
  // @ts-expect-error - a span is two instants.
  setDomain([0]);
  return view.domain?.[0];
}

export const unused = [Schedule, Lane];
