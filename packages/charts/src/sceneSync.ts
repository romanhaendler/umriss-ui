/* Cursor sync (charts-long-series 04) and the loading state that ends it: the
   groups of charts that share a `syncId`, and the pointer's x position going
   to all of them. Functions over the scene; the scene holds a `SyncState`. */

import type { ChartScene } from "./scene";
import { markOverlayDirty, markLayoutDirty } from "./sceneBinding";
import { pointerLeave } from "./sceneHit";
import { findAxis } from "./sceneLayout";
import type { SyncedX } from "./sceneModel";

/** What one chart holds of the sync. */
export interface SyncState {
  id: string | null;
  /** Where another chart's pointer stands; null while none does. */
  synced: SyncedX | null;
  sent: SyncedX | null;
}

export function newSyncState(): SyncState {
  return { id: null, synced: null, sent: null };
}

/** Charts that share a `syncId`: the pointer's x position goes to all of
    them. */
const syncGroups = new Map<string, Set<ChartScene>>();

export function setSyncId(s: ChartScene, id: string | null): void {
  const sync = s.sync;
  if (id === sync.id) return;
  if (sync.id !== null) {
    share(s, null);
    const group = syncGroups.get(sync.id);
    group?.delete(s);
    if (group?.size === 0) syncGroups.delete(sync.id);
    // The crosshair the old group asked for is no longer this chart's.
    sync.synced = null;
    markOverlayDirty(s);
  }
  sync.id = id;
  if (id !== null) {
    const group = syncGroups.get(id) ?? new Set<ChartScene>();
    group.add(s);
    syncGroups.set(id, group);
  }
}

/** The rows are on their way (chart-loading): the pointer's hover ends, as
    the stale plot takes no pointer, and no position is shared either way. A
    key's point stays - the keys still walk. */
export function setLoading(s: ChartScene, loading: boolean): void {
  if (loading === s.loading) return;
  s.loading = loading;
  if (loading) {
    pointerLeave(s);
    share(s, null);
    // A drag under way would pan on: a captured pointer passes the stale
    // plot's pointer-events.
    s.pointers.clear();
    s.pinch = 0;
  }
  // Laid out anew: the layout snapshot carries it, so that the empty message
  // waits for the frame that lays out the answer.
  markLayoutDirty(s);
}

/** A loading chart shares no position either - its key's point included. */
export function share(s: ChartScene, x: SyncedX | null): void {
  const sync = s.sync;
  if (s.loading) x = null;
  if (sync.id === null || (x?.value === sync.sent?.value && x?.axisId === sync.sent?.axisId)) return;
  sync.sent = x;
  for (const other of syncGroups.get(sync.id) ?? []) {
    if (other === s) continue;
    other.sync.synced = x;
    other.markOverlayDirty();
  }
}

/** The crosshair a synced position asks for, in this chart's pixels. None
    while loading: it would point at values being replaced. */
export function syncedPx(s: ChartScene): number | null {
  const x = s.sync.synced;
  if (x === null || s.loading) return null;
  const axis = findAxis(s, "x", x.axisId) ?? s.layout.axes.find((a) => a.orientation === "x") ?? null;
  return axis === null ? null : axis.scale.toPx(x.value);
}
