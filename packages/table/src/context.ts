/* How a part without a row type finds its table: placed inside it through the
   context, outside it through `of`. */

import { createContext, useContext, useSyncExternalStore } from "react";
import { registryOf } from "./registry";
import type { Registry } from "./registry";
import type { TableRef, TableSnapshot } from "./types";

export interface TableContextValue {
  registry: Registry;
  /** Where the pagination bar portals to: underneath the table. */
  footerTarget: HTMLElement | null;
}

export const TableContext = createContext<TableContextValue | null>(null);

const neverSubscribe = () => () => undefined;
const nothing = () => 0;

export interface Connection {
  registry: Registry;
  snapshot: TableSnapshot<unknown>;
  /** Does the part stand inside the table or beside it? */
  inside: boolean;
  footerTarget: HTMLElement | null;
}

/** The table a part stands in - or the one it gets through `of`. */
export function useConnection(of: TableRef | undefined): Connection | null {
  const surrounding = useContext(TableContext);
  const registry = of ? (registryOf(of.Table) ?? null) : (surrounding?.registry ?? null);
  useSyncExternalStore(
    registry ? registry.subscribe : neverSubscribe,
    registry ? registry.bodyVersion : nothing,
    registry ? registry.bodyVersion : nothing,
  );
  const snapshot = registry?.hook?.publicSnapshot;
  if (!registry || !snapshot) return null;
  return { registry, snapshot, inside: !of && surrounding !== null, footerTarget: of ? null : (surrounding?.footerTarget ?? null) };
}
