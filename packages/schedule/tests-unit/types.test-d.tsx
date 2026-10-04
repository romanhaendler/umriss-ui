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
    <Plan ariaLabel="Plan" initialDomain={[0, 1]}>
      <Row id="a" />
      {/* @ts-expect-error - a subtask is the library's own type. */}
      <Subtasks data={[{ id: "x" }]} tasks={[]} />
    </Plan>
  );
}

export const unused = [Schedule, Lane];
