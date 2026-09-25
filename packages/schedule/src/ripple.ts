/* Ripple: the cascade, as arithmetic and never as behaviour (ADR-0023).

   Whether a successor may move is a plant decision - a fixed shift, a booked
   crew, a frozen order - that a drawing package cannot know. What it can know
   is the arithmetic: which successors no longer fit behind a change, and where
   they would have to go. The schedule never runs this; a caller runs it over its
   own data, when its domain allows.

   A successor is pushed later by exactly what its dependency is missing, its
   main time keeping its length, and never pulled earlier: room that opens up is
   the planner's to use. The push carries down the chain. */

import { applyIntent, arrival, departure, type Intent, type MoveIntent, type Subtask, type Dependency } from "./model";

/** The moves that push every successor whose dependency no longer fits after
    `intent` - transitively, in the order they were first pushed. The subtask the
    intent is about is never moved, and a cycle among the successors ends after a
    bounded number of pushes instead of running on. */
export function ripple(
  subtasks: readonly Subtask[],
  dependencies: readonly Dependency[],
  intent: Intent,
): MoveIntent[] {
  /* A place intent pushes nothing: the subtask it asks for does not exist yet,
     and until the caller has created it and named its dependencies there is no
     successor to push. Run `ripple` again over the data that has it. */
  if (intent.kind === "place") return [];
  const current = new Map(subtasks.map((s) => [s.id, applyIntent(s, intent)] as const));
  const leaving = new Map<string, Dependency[]>();
  for (const dependency of dependencies) {
    const list = leaving.get(dependency.from) ?? [];
    list.push(dependency);
    leaving.set(dependency.from, list);
  }

  const moved = new Map<string, MoveIntent>();
  const queue = [intent.subtask];
  /* Every push moves a subtask strictly later, so an acyclic plan settles on
     its own; the bound only matters for a cycle, which could push forever. */
  let budget = (subtasks.length + 1) * (dependencies.length + 1);

  while (queue.length > 0 && budget-- > 0) {
    const id = queue.shift()!;
    const from = current.get(id);
    if (from === undefined) continue;
    for (const dependency of leaving.get(id) ?? []) {
      if (dependency.to === intent.subtask) continue;
      const to = current.get(dependency.to);
      if (to === undefined) continue;
      const shortBy = departure(dependency, from) + dependency.lag - arrival(dependency, to);
      if (!(shortBy > 0)) continue;
      const move: MoveIntent = { kind: "move", subtask: to.id, from: to.from + shortBy, to: to.to + shortBy };
      current.set(to.id, applyIntent(to, move));
      /* A second push of the same successor replaces the first and keeps its
         place in the order. */
      moved.set(to.id, move);
      queue.push(to.id);
    }
  }
  return [...moved.values()];
}
