/* A number column's `format` is Intl's options, checked by the compiler: a key
   Intl does not know is an error. Compiled by `typecheck`, never run. */

import { useTable } from "../src";

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
