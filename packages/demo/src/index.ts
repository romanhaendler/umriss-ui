/* The shell of the demos (table-demo, decision A).

   A private package, never published. All four packages use it from their
   `demo/` directories and browser suites, never from `src/` - the lint holds
   that. It itself takes only the public entry of @umriss-ui/core; that charts'
   demo may take it too is ADR-0020. */

export { Shell } from "./Shell";
export type { ShellProps } from "./Shell";
export { Page } from "./Page";
export type { PageProps } from "./Page";
export { buildDemo } from "./demo";
export type { Demo, DemoSources } from "./demo";
export type { Example } from "./tooling/examples";
export type { PropEntry, TypeEntry } from "./tooling/propsReader";
