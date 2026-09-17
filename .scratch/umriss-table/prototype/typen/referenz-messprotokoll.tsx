/* Referenztabelle 2: Messprotokoll. Zahlen, `format`, `footer`,
   `VerdictColumn`, eine Spalte mit fehlenden Werten, Virtualisierung. */

import { Sparkline, useTabelle } from "./api";
import type { GrenzwertSatz } from "./api";

interface Messung {
  id: string;
  merkmal: string;
  messwert: number | null;
  sollwert: number;
  auslastung: number;
  gemessen: Date;
  verlauf: number[];
  bemerkung?: string;
}

const GRENZEN: GrenzwertSatz = {
  grenzwerte: [{ wert: 10.2, seite: "oben", stufe: "alarm" }],
  sollwert: 10,
};

declare function Zahl(props: { wert: number; einheit: string; vorzeichen?: boolean }): React.ReactNode;

export function Messprotokoll({ messungen }: { messungen: Messung[] }) {
  const { Table, Column, VerdictColumn, RowDetail } = useTabelle(messungen, {
    rowKey: (m) => m.id,
    virtual: { rowHeight: 32 },
  });

  return (
    <Table stickyHeader stickyRowHeader maxHeight="480px">
      <Column value="merkmal" label="Merkmal" rowHeader />
      <VerdictColumn value="messwert" label="Messwert" limits={GRENZEN} />
      <Column
        id="abweichung"
        label="Abweichung"
        value={(m) => (m.messwert === null ? null : m.messwert - m.sollwert)}
        footer="avg"
        format={{ nachkomma: 2 }}
      >
        {(abw) => <Zahl wert={abw} einheit="mm" vorzeichen />}
      </Column>
      <Column value="auslastung" label="Auslastung" format="prozent" footer="avg" />
      <Column value="gemessen" label="Gemessen" format="zeit" />
      <Column value="bemerkung" label="Bemerkung" />
      <Column id="verlauf" label="Verlauf" value={(m) => m.verlauf}>
        {(verlauf) => <Sparkline data={verlauf} />}
      </Column>
      <RowDetail>{(m) => <p>{m.merkmal}</p>}</RowDetail>
    </Table>
  );
}
