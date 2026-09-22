/* Span geometry.

   A span has a beginning and an end of its own. That is the difference from the
   state band (see state.ts) and the whole reason this is a second module: a
   partition derives the end of every segment from the beginning of the next and
   thereby forbids both of the things that really occur in a schedule - idle time
   between two spans, and two spans covering one another on one lane. The second
   is what a planner is looking for. Do not merge the two modules.

   Deliberately free of the DOM and of the scene, like bars.ts: the arithmetic is
   the one place behind which there is no pictorial intuition.

   The file is called after the spans and not `span.ts`, because <Span> is the
   component: on a file system that does not distinguish upper and lower case an
   import of `./Span` would find a `span.ts` lying beside it. Same reason as
   bars.ts and cells.ts; see CONTEXT.md on module names.

   The encodings in one sentence each:
   - NaN in the beginning means "there is no span here" - the gap, the way every
     series kind of this library writes it. It is never drawn and never hit.
   - No finite end (NaN or infinity) means "not over yet": the span runs to the
     edge of the domain and counts as open. A job that is still running is worth
     seeing; drawn with width zero it is not.
   - End equal to beginning means "point in time": a valid statement, without
     extent.
   - End before beginning means "data error": it is not swapped round.
   The last two cover no interval; they therefore cover nothing and are not hit. */

/** How far a covering span is moved within its lane, per depth, as a fraction
    of its height - the drawing and the hit test share it, so that what is hit
    is what is seen. */
export const DEPTH_OFFSET = 0.28;

/** The end calculated with: the one given, and where none is given, the end of
    the axis domain. */
export function spanEnd(to: number, domainEnd: number): number {
  return Number.isFinite(to) ? to : domainEnd;
}

/** Does the span have no end of its own? Then it runs to the edge and is marked
    open - the mark is needed, because otherwise the edge would look like a
    measured end. */
export function isOpen(to: number): boolean {
  return !Number.isFinite(to);
}

/** Does the span cover an interval at all? A NaN beginning is no span, and an
    end that does not lie beyond the beginning spans nothing - neither the point
    in time nor, all the more, the data error. */
function covers(from: number, end: number): boolean {
  return from < end;
}

/** For every span: how many EARLIER registered spans it covers. Drives a small
    offset within the lane, so that both stay visible.

    No automatic packing into sub-lanes. Packing turns the double booking into a
    layout decision and thereby hides the very conflict for whose sake somebody
    opened the schedule. The conflict is the finding.

    Counted only backwards, never forwards: that way every span keeps its offset
    when a later one joins, instead of the whole picture jumping. Touching at a
    shared edge is not a covering - the one stops where the other starts.

    Quadratic in the number of spans and without sorting: this runs once during
    materialisation, not per frame, and a lane holds jobs, not a measurement
    series. */
export function overlapDepth(
  from: Float64Array,
  to: Float64Array,
  n: number,
  domainEnd: number,
): Int32Array {
  const depth = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    const a = from[i] as number;
    const e = spanEnd(to[i] as number, domainEnd);
    if (!covers(a, e)) continue;
    let count = 0;
    for (let j = 0; j < i; j++) {
      const aj = from[j] as number;
      const ej = spanEnd(to[j] as number, domainEnd);
      if (!covers(aj, ej)) continue;
      if (a < ej && aj < e) count++;
    }
    depth[i] = count;
  }
  return depth;
}

/** Index of the span under (targetX, targetLane), -1 where none lies.

    The rule under covering: the one registered LAST wins, so the largest index.
    Defined and not arbitrary - the same span on every call, and it is the one
    that the offset from overlapDepth lays on top. Hence the search runs from the
    back.

    The beginning belongs to the span, the end no longer does: the same boundary
    rule as in the state band, otherwise a point would belong to two abutting
    spans.

    Linear, not binary: spans are not assumed sorted - they may cover one
    another, and then there is no order over which a binary search could
    conclude. One pointer hit per movement over a lane full of jobs is not worth
    that.

    `depth` and `depthShift` place a covering span where it is drawn: moved by
    its depth times the shift, in lane units. Without them every span sits on
    its lane. */
export function spanIndex(
  from: Float64Array,
  to: Float64Array,
  lane: Float64Array,
  n: number,
  targetX: number,
  targetLane: number,
  laneHeight: number,
  domainEnd: number,
  depth: Int32Array | null = null,
  depthShift = 0,
): number {
  const half = laneHeight / 2;
  for (let i = n - 1; i >= 0; i--) {
    const s = (lane[i] as number) + (depth === null ? 0 : (depth[i] as number) * depthShift);
    // A schedule has many lanes. Without the lane condition the span registered
    // last would catch everything lying anywhere beneath it.
    if (!(Math.abs(s - targetLane) <= half)) continue;
    const a = from[i] as number;
    const e = spanEnd(to[i] as number, domainEnd);
    // A NaN beginning drops out here of its own accord: every comparison with
    // NaN is false. A point in time and a backwards running span likewise,
    // because no targetX can be both >= a and < e.
    if (targetX >= a && targetX < e) return i;
  }
  return -1;
}
