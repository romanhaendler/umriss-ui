import { version } from "react";

/* The `inert` attribute, on both React lines the library runs on.

   React 19 knows `inert` as a boolean attribute and writes it for `true`; React
   18 does not, drops a boolean on an unknown attribute, and writes it only for
   a string - which 19 in turn reads as false. So the value follows the major
   in use. Internal. */

const value = Number.parseInt(version, 10) >= 19 ? true : ("" as unknown as boolean);

/** `inert` when `on`, nothing otherwise - spread onto the element. */
export function inertWhen(on: boolean): { inert: boolean | undefined } {
  return { inert: on ? value : undefined };
}
