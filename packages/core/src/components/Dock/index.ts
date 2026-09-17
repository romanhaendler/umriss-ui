export { Dock } from "./Dock";
export type { DockProps, DockTool, DockPlace } from "./Dock";

/* `place.ts` stays inside. It lies beside the component because it is the
   checkable part (docs/testing.md, "Pure modules"), and not because it belongs to the
   outside: `StripMetrics` is the shape this CSS produces today, and
   `stripLength` its arithmetic. Both would be a promise about internals nobody
   asked for - and one that would turn rebuilding the capsule into a breaking
   change.

   What is exported is therefore only what the caller really has in hand:
   `DockPlace`, the outside of the resting place. */
