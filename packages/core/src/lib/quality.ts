/* Quality: the third axis a value has (ADR-0077), beside the verdict and the
   freshness (ADR-0010).

   A value's SOURCE says how far it vouches for it. The levels are the three
   severities of an OPC UA status code; the application maps its source's code
   (or any other protocol's quality) to one of them. This module knows no code
   and no sub-status.

   Quality never touches the other statements. It does not change the verdict
   (a bad value in alarm is still in alarm), the freshness (a stale value keeps
   its quality, a bad value keeps its age) or the value (a bad value keeps its
   number). It is never derived from the value, the limits or the age, and no
   function here weighs one level against another. */

/** How far a value's source vouches for it - independently of how the value is judged and how old it is.
    The levels are the severities of an OPC UA status code; mapping a code (or another protocol's quality) to a level is the application's. */
export type Quality = "good" | "uncertain" | "bad";
