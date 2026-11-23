/* A number column's `format` is Intl's options, checked by the compiler: a key
   Intl does not know is an error. Compiled by `typecheck`, never run. */

import type { NumberFormat as CoreNumberFormat } from "@umriss-ui/core";
import { useTable } from "../src";
import type { NumberFormat } from "../src";

declare const rows: { id: string; amount: number }[];

export function Columns() {
  const { Column } = useTable(rows, { rowKey: (r) => r.id });
  return (
    <>
      <Column value="amount" label="A" format={{ style: "currency", currency: "EUR", decimals: 1 }} />
      <Column value="amount" label="B" format={{ useGrouping: false }} />
      {/* @ts-expect-error Intl has no such option */}
      <Column value="amount" label="C" format={{ currencyy: "EUR" }} />
    </>
  );
}

/* The table declares its own `NumberFormat` (the props gate wants a local
   declaration); it and core's stay assignable both ways. */

declare const own: NumberFormat;
declare const core: CoreNumberFormat;
export const fromOwn: CoreNumberFormat = own;
export const fromCore: NumberFormat = core;
