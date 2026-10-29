/* The jump palette's candidates: the package's search fragment, the other
   packages' index from the site, and the weights that order what they find. */

import { useEffect, useMemo, useState } from "react";
import type { Demo } from "./demo";
import { BASE } from "./href";
import { searchEntries, unpackSearch, type PackedSearch, type SearchEntry, type SearchKind } from "./search";

/* The palette's candidates are the search entries (`search.ts`) translated
   into the palette's language (CONTEXT.md, "Finding"): the id IS the entry's
   address, so that choosing has nothing to look up.

   The matcher sorts name finds before group finds before keyword finds.
   Inside one of those tiers the kind decides, broadest first - a page above
   its examples, an example above a prop - in steps far wider than any rank a
   match earns. The own package wins a tie and nothing more: half a point is
   the smallest step between two matches. */
const KIND_WEIGHT: Readonly<Record<SearchKind, number>> = {
  page: 60_000,
  scenario: 50_000,
  example: 40_000,
  export: 30_000,
  prop: 20_000,
  token: 10_000,
  wording: 0,
};
const OWN_PACKAGE_WEIGHT = 0.25;

/* THE PALETTE'S TWO SOURCES. The package's search fragment is a part of
   the bundle of its own, fetched on the palette's first opening and kept.
   Until it has arrived - or if it never does - the palette searches the
   same pages, scenarios and examples from the outline in hand, so the
   window is never empty and a lost request breaks nothing.

   The other four packages come from the site's index (`search.json` at the
   site's root, `scripts/build-site.mjs`), fetched on the same first
   opening, without the own package's entries, which the fragment already
   has. A demo standing alone - the dev server, the test build - has no
   site above it and fetches nothing. A failed fetch is silent: the reader
   can do nothing about it, and the own package is still searched. */
export function usePaletteSearch(demo: Demo, paletteOpen: boolean, site: string) {
  const { OUTLINE } = demo.addresses;
  const ownId = demo.packageName.split("/")[1]!;
  const [fragment, setFragment] = useState<readonly SearchEntry[] | null>(null);
  const [elsewhere, setElsewhere] = useState<readonly SearchEntry[] | null>(null);
  useEffect(() => {
    if (!paletteOpen || fragment !== null) return;
    demo.search().then(setFragment, () => {});
  }, [paletteOpen, fragment, demo]);
  useEffect(() => {
    if (!paletteOpen || elsewhere !== null || site === BASE) return;
    fetch(`${site}search.json`)
      .then((response) => (response.ok ? (response.json() as Promise<PackedSearch>).then(unpackSearch) : []))
      .then((entries) => setElsewhere(entries.filter((entry) => !entry.address.startsWith(`/${ownId}/`))))
      .catch(() => setElsewhere([]));
  }, [paletteOpen, elsewhere, ownId, site]);
  return useMemo(
    () =>
      [...(fragment ?? searchEntries(ownId, OUTLINE, demo.scenarios, demo.examples)), ...(elsewhere ?? [])].map((entry) => ({
        id: entry.address,
        label: entry.label,
        group: entry.group,
        /* The package before the heading is shown, not searched: "core" or
           "tab" would otherwise find every entry of a package. */
        searchedGroup: entry.group.replace(/^[^·]* · /, ""),
        keywords: entry.keywords,
        weight: KIND_WEIGHT[entry.kind] + (entry.address.startsWith(`/${ownId}/`) ? OWN_PACKAGE_WEIGHT : 0),
      })),
    [fragment, elsewhere, ownId, OUTLINE, demo.scenarios, demo.examples],
  );
}
