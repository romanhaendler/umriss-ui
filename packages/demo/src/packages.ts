/* The five packages, in their fixed order: what the header lists, what the
   front page shows and what the pages build walks. Written once, so that a
   sixth package is added in one place.

   Like the outlines, this file imports nothing: the pages build loads it in
   Node without a bundler. The version is not here - it is read from each
   package's manifest, which already carries it. */

export interface Package {
  /** The directory under `packages/`, and the demo's directory on the site. */
  id: string;
  /** The name a visitor reads in the header. */
  name: string;
  /** The name on npm. */
  npm: string;
  /** What the package is for, in a few words. */
  role: string;
  /** The id of the page to start reading with. */
  start: string;
}

/* The start pages carry today's ids. `sidebar-tree` moves the table's to
   `first-table`; the entry follows it then. */
export const PACKAGES: readonly Package[] = [
  { id: "core", name: "Core", npm: "@umriss-ui/core", role: "Controls, overlays and layout: the base of the others", start: "installation" },
  { id: "charts", name: "Charts", npm: "@umriss-ui/charts", role: "Canvas charts for series, states and limits", start: "installation" },
  { id: "table", name: "Table", npm: "@umriss-ui/table", role: "A typed data table for many rows", start: "table" },
  { id: "schedule", name: "Schedule", npm: "@umriss-ui/schedule", role: "Work on lanes over time", start: "schedule" },
  { id: "calculation", name: "Calculation", npm: "@umriss-ui/calculation", role: "A figure shown with how it came about", start: "installation" },
];
