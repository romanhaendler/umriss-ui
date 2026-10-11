/* The registration model: series, axes and limits register with
   a configuration, and a changed configuration is compared field by field so
   that a re-render does not materialise again. Registration order is drawing
   order, palette assignment and band stacking. Functions over the scene. */

import type { ChartScene } from "./scene";
import { markLayoutDirty } from "./sceneBinding";
import {
  laneOf,
  forget,
  fnEqual,
  namesEqual,
  calendarEqual,
  takesPalette,
  listEqual,
  materialEqual,
  stackOf,
  ownFieldsEqual,
  domainEqual,
} from "./sceneConfig";
import { type SeriesEntry } from "./sceneModel";
import { isHidden, zooms } from "./sceneView";
import type { AxisConfig, LimitConfig, SeriesConfig } from "./types";

let nextRegistration = 0;

/** The palette place for a new registration. On the first mount, in JSX order,
    it is the same number as the index in the registration - every registration
    counts on, named or not. */
export function slotFor(s: ChartScene, name: string | undefined): number {
  if (name === undefined) return s.nextSlot++;
  const known = s.slotsByName.get(name);
  if (known !== undefined && !slotTaken(s, known)) return known;
  const next = s.nextSlot++;
  if (known === undefined) s.slotsByName.set(name, next);
  return next;
}

/** Is a named series currently standing on this palette place? A taken place is
    not assigned a second time: two series of the same name standing at once
    share no colour, and a name that a rename has left behind does not get the
    colour of the renamed series. */
export function slotTaken(s: ChartScene, slot: number, except?: SeriesEntry): boolean {
  for (const e of s.series.values()) {
    if (e !== except && e.config.name !== undefined && e.slot === slot) return true;
  }
  return false;
}

export function registerSeries(s: ChartScene, config: SeriesConfig): number {
  const id = nextRegistration++;
  s.series.set(id, {
    order: id,
    config,
    slot: takesPalette(config) ? slotFor(s, config.name) : -1,
    lastSlot: null,
    materialized: null,
    rows: null,
    extent: null,
    step: null,
    cellHeight: null,
    buckets: null,
    own: null,
    stacked: null,
  });
  s.materialsDirty = true;
  markLayoutDirty(s);
  return id;
}

export function updateSeries(s: ChartScene, id: number, config: SeriesConfig): void {
  const entry = s.series.get(id);
  if (entry === undefined) return;
  const previous = entry.config;
  const dataEqual = materialEqual(previous, config);
  const equal =
    dataEqual &&
    previous.xAxisId === config.xAxisId &&
    previous.yAxisId === config.yAxisId &&
    previous.name === config.name &&
    fnEqual(previous.format, config.format) &&
    previous.color === config.color &&
    previous.tone === config.tone &&
    isHidden(s, previous) === isHidden(s, config) &&
    ownFieldsEqual(previous, config);
  if (entry.slot < 0 && takesPalette(config)) {
    entry.slot = slotFor(s, config.name);
  } else if (previous.name !== config.name && config.name !== undefined && entry.slot >= 0) {
    // A rename takes its colour with it - unless the new name already has a
    // free place; then the name wins.
    const known = s.slotsByName.get(config.name);
    if (known === undefined) s.slotsByName.set(config.name, entry.slot);
    else if (!slotTaken(s, known, entry)) entry.slot = known;
  }
  entry.config = config;
  if (equal) return; // no dirty flag without a change of substance
  // Another lane is another category of the y axis: they are read anew.
  if (laneOf(previous) !== laneOf(config)) s.materialsDirty = true;
  entry.buckets = null; // the colouring may have changed
  // A hidden member leaves its place in the stack: the others sum anew.
  if (isHidden(s, previous) !== isHidden(s, config) && stackOf(config) !== undefined) s.materialsDirty = true;
  // On another axis a series lies somewhere else - and its categories and
  // its lane go with it.
  if (!dataEqual || previous.xAxisId !== config.xAxisId || previous.yAxisId !== config.yAxisId) {
    forget(entry);
    s.materialsDirty = true;
  }
  markLayoutDirty(s);
}

export function registerAxis(s: ChartScene, config: AxisConfig): number {
  const id = nextRegistration++;
  s.axes.set(id, { order: id, config });
  s.materialsDirty = true; // x materialisation depends on axis accessors
  markLayoutDirty(s);
  return id;
}

export function updateAxis(s: ChartScene, id: number, config: AxisConfig): void {
  const entry = s.axes.get(id);
  if (entry === undefined) return;
  const previous = entry.config;
  const accessorEqual =
    fnEqual(previous.accessor, config.accessor) && calendarEqual(previous.calendar, config.calendar);
  const equal =
    accessorEqual &&
    previous.id === config.id &&
    previous.orientation === config.orientation &&
    previous.position === config.position &&
    previous.label === config.label &&
    previous.tickCount === config.tickCount &&
    previous.grid === config.grid &&
    previous.time === config.time &&
    previous.alignTicks === config.alignTicks &&
    listEqual(previous.ticks as number[] | undefined, config.ticks as number[] | undefined) &&
    namesEqual(previous.categories, config.categories) &&
    fnEqual(previous.categoryLabel, config.categoryLabel) &&
    domainEqual(previous.domain, config.domain) &&
    zooms(s, previous) === zooms(s, config) &&
    fnEqual(previous.tickFormat, config.tickFormat);
  entry.config = config;
  if (equal) return;
  // Another list is other places, and `time` decides whether a string is a
  // category or an instant: materialisation reads the axis anew.
  if (!namesEqual(previous.categories, config.categories) || previous.time !== config.time) s.materialsDirty = true;
  if (!accessorEqual || previous.id !== config.id) {
    for (const entry of s.series.values()) forget(entry);
    s.materialsDirty = true;
  }
  markLayoutDirty(s);
}

export function registerLimit(s: ChartScene, config: LimitConfig): number {
  const id = nextRegistration++;
  s.limits.set(id, { order: id, config });
  markLayoutDirty(s);
  return id;
}

export function updateLimit(s: ChartScene, id: number, config: LimitConfig): void {
  const entry = s.limits.get(id);
  if (entry === undefined) return;
  const previous = entry.config;
  entry.config = config;
  const equal =
    previous.kind === config.kind &&
    previous.axisId === config.axisId &&
    previous.orientation === config.orientation &&
    previous.severity === config.severity &&
    previous.role === config.role &&
    previous.label === config.label &&
    previous.color === config.color &&
    previous.inExtent === config.inExtent &&
    (previous.kind === "line" && config.kind === "line"
      ? previous.value === config.value
      : previous.kind === "band" && config.kind === "band"
        ? previous.from === config.from && previous.to === config.to
        : false);
  if (equal) return;
  markLayoutDirty(s);
}
