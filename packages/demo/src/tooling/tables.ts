/* Access to the generated props tables.

   `props.json` is produced on every `dev`, `build:demo` and `typecheck` of a
   demo out of its `src/` (see `props.ts`). It is not checked in: a checked-in
   generation drifts away from its source.

   The one place where the shell looks a table up - everything else works with
   `TypeEntry`. */

import type { TypeEntry } from "./propsReader";

export type { PropEntry, TypeEntry } from "./propsReader";

/** A page's tables, in the order of its outline. */
export function tablesOf(
  types: Readonly<Record<string, TypeEntry>>,
  typNamen: readonly string[],
): readonly TypeEntry[] {
  return typNamen.map((name) => {
    const entry = types[name];
    if (entry === undefined) {
      throw new Error(`\`${name}\` has no generated table - did \`pnpm props\` run?`);
    }
    return entry;
  });
}
