/* The typing, checked by the compiler. This file does
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

/* Either name names the schedule; a dependency is named by its subtasks. */
export function Names() {
  const { Schedule: Plan } = useSchedule();
  const named: import("../src").Dependency = { id: "d", predecessor: "a", successor: "b", lag: 0 };
  // @ts-expect-error - one of the two ends is not enough.
  const half: import("../src").Dependency = { id: "d", predecessor: "a", lag: 0 };
  return (
    <>
      <Plan aria-labelledby="title" barLabel={(s) => s.id} endMarks="none" />
      <Plan aria-label="Plan" aria-labelledby="title" />
      {/* @ts-expect-error - neither name is given. */}
      <Plan aria-describedby="x" />
      {[named, half]}
    </>
  );
}

/* The schedule and the charts each declare `ZoomLimits`; nothing but this holds
the two equal. */
declare const ownLimits: import("../src").ZoomLimits;
declare const chartsLimits: import("@umriss-ui/charts").ZoomLimits;
export const limitsFromOwn: import("@umriss-ui/charts").ZoomLimits = ownLimits;
export const limitsFromCharts: import("../src").ZoomLimits = chartsLimits;
