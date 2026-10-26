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
    <Plan aria-label="Plan">
      <Row id="a" />
      {/* @ts-expect-error - a subtask is the library's own type. */}
      <Subtasks data={[{ id: "x" }]} tasks={[]} />
      {/* @ts-expect-error - the span in view is the view's (ADR-0047): useSchedule({ initialView }). */}
      <Plan aria-label="Plan" initialDomain={[0, 1]} />
      {/* @ts-expect-error - and so are the folded groups: no controlled pair beside the view. */}
      <Plan aria-label="Plan" collapsedGroups={[]} />
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

declare const anElement: import("react").RefObject<HTMLDivElement | null>;
declare const aHandle: import("react").RefObject<{ positionAt: () => null } | null>;
declare const aButton: import("react").RefObject<HTMLButtonElement | null>;

/* The `ref` is the root <div>; a ref typed at a handle is not. */
export function Refs() {
  const { Schedule: Plan } = useSchedule();
  return (
    <>
      <Plan ref={anElement} data-testid="plan" aria-label="Plan" />
      {/* @ts-expect-error - a handle is not the root. */}
      <Plan ref={aHandle} aria-label="Plan" />
      {/* @ts-expect-error - another element is not the root. */}
      <Plan ref={aButton} aria-label="Plan" />
      {/* @ts-expect-error - a name is required. */}
      <Plan />
    </>
  );
}
