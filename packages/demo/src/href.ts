/* The one spot that joins an address of the outline to the demo's base.

   The base is `/` in the dev server and `/umriss-ui/<package>/` on the site
   (scripts/build-pages.mjs); every address stands below it (ADR-0036). This
   is a file of its own and not part of `outline.ts` because the outline runs
   in Node too, where Vite's `import.meta.env` does not exist. */

import { addressOfPlace } from "./outline";

export const BASE = import.meta.env.BASE_URL;

/** An address of the outline (`/button/#basic`) as an `href`. */
export function hrefOf(address: string): string {
  return BASE + address.slice(1);
}

/** A link written in a page's text: a place as `#/button` becomes the page's
    address, anything else stays as written. */
export function hrefOfText(href: string): string {
  return href.startsWith("#/") ? hrefOf(addressOfPlace(href)) : href;
}

/** A page of a neighbouring demo, which the site keeps in a directory named
    after its package, beside this one. */
export function hrefOfNeighbour(packageName: string, pageId: string): string {
  return `${BASE.replace(/[^/]+\/$/, "")}${packageName.split("/")[1]}${addressOfPlace(`/${pageId}`)}`;
}
