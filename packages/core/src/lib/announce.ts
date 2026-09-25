/* The one voice of the library's lists (listbox-announcements 01).

   VoiceOver reads an `aria-activedescendant` option poorly - no count, no
   selected state (React Aria's combobox study, docs/research/library-
   comparison-2026-09/headless_a11y.md) - so the combobox, the multi-select and
   the command palette say it themselves, through a polite live region. One
   region and not one per component: two lists open one after the other would
   otherwise speak over each other, and a region that is mounted in the same
   moment as its first text is often not heard at all. It lives in the module
   and not in the provider, so that it works without one and stays one under
   several.

   Internal, like `portalTargetFor`. */

import { portalTargetFor } from "./portalTarget";

/** Announcements wait for the keys to rest this long - the charts' readout
    pause (charts-a11y R11): a held arrow key speaks where it stops, and a
    typed word is counted once and not per letter. */
export const ANNOUNCE_REST = 150;

const regions = new WeakMap<Element, HTMLElement>();
/* One timer across all places: the library has one voice, and a later
   announcement replaces a waiting one wherever either was to be spoken. */
let timer: ReturnType<typeof setTimeout> | null = null;

/** The region of a place, built once and built anew when the page removed it. */
function regionIn(host: Element): HTMLElement {
  const known = regions.get(host);
  if (known?.parentElement === host) return known;
  const region = document.createElement("div");
  region.setAttribute("role", "status");
  region.setAttribute("aria-live", "polite");
  region.setAttribute("data-umriss-announcer", "");
  /* `VisuallyHidden`'s rule, written here rather than imported: a module in
     lib does not reach up into a component's stylesheet. No token in it. */
  region.style.cssText =
    "position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0";
  host.append(region);
  regions.set(host, region);
  return region;
}

/**
 * Says `text` once announcements have rested for `ANNOUNCE_REST`; a later call
 * within the rest replaces an earlier one.
 *
 * `at` is the element that speaks. Inside a modal `<dialog>` everything else
 * is inert and a region there is silent, so the region is the dialog's own -
 * the portal target's rule, without the provider's setting: that decides where
 * a surface is laid out, and a region is laid out nowhere.
 */
export function announce(text: string, at?: Element | null): void {
  if (typeof document === "undefined") return;
  // Built now and written later: a region must stand before its text changes.
  const region = regionIn(portalTargetFor(at, () => null));
  if (timer !== null) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    /* A new node every time: the same words twice - the count after a
       letter that changed nothing, the last option at the end of the list -
       are an addition, and only additions are spoken. */
    const words = document.createElement("div");
    words.textContent = text;
    region.replaceChildren(words);
  }, ANNOUNCE_REST);
}

/** Drops an announcement still waiting - a list that closed has nothing
    more to count. */
export function silence(): void {
  if (timer !== null) clearTimeout(timer);
  timer = null;
}
