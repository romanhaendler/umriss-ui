/* The generated props tables' types.

   `props.json` is produced on every `dev`, `build:demo` and `typecheck` of a
   demo out of its `src/` (see `props.ts`). It is not checked in: a checked-in
   generation drifts away from its source. A page looks its tables up through
   `apiSection` (`apiTable.ts`). */

export type { PropEntry, TypeEntry } from "./propsReader";
