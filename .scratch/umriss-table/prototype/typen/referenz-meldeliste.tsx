/* Referenztabelle 4: AlarmList, gegen ihre heutigen Props und meldeModell.
   Die Liste bekommt eine fertige Sicht; die Tabelle darf deshalb weder
   sortieren noch blaettern - sie zeigt, was das Meldemodell geordnet hat. */

import { useTabelle } from "./api";
import type {
  MeldeSicht,
  Meldezeile,
  Meldezustand,
  Prioritaet,
} from "../../../../packages/ui/src/components/AlarmList/meldeModell";

declare function Badge(props: { tone?: "danger" | "warning" | "neutral"; pill?: boolean; children: React.ReactNode }): React.ReactNode;
declare const wortlaut: {
  spalteMeldung: string; spalteZustand: string; spaltePrioritaet: string;
  spalteZeit: string; spalteDauer: string; spalteHaeufigkeit: string;
  flattertHinweis: (n: number) => string; keineMeldungen: string;
};
declare function zustandsWort(z: Meldezustand): string;
declare function prioritaetsWort(p: Prioritaet): string;
declare function prioritaetsTon(p: Prioritaet): "danger" | "warning" | "neutral";
declare function dauerWort(ms: number): string;

export function AlarmTabelle({ sicht, auswaehlbar }: { sicht: MeldeSicht; auswaehlbar: boolean }) {
  const { Table, Column } = useTabelle(sicht.sichtbar, { rowKey: (z) => z.id });
  return (
    <Table
      selectable={auswaehlbar}
      stickyHeader
      density="compact"
      empty={wortlaut.keineMeldungen}
      rowProps={(z) => ({ "data-zustand": z.zustand, "data-prioritaet": z.prioritaet })}
    >
      <Column id="art" label={wortlaut.spalteMeldung} value={(z) => z.art.beschriftung} rowHeader sortable={false}>
        {(beschriftung, z) => (
          <>
            <span>{beschriftung}</span>
            {z.flattert && <Badge tone="warning" pill>{wortlaut.flattertHinweis(z.haeufigkeit)}</Badge>}
          </>
        )}
      </Column>
      <Column value="zustand" label={wortlaut.spalteZustand} sortable={false}>
        {(zustand) => zustandsWort(zustand)}
      </Column>
      <Column value="prioritaet" label={wortlaut.spaltePrioritaet} sortable={false}>
        {(p) => <Badge tone={prioritaetsTon(p)}>{prioritaetsWort(p)}</Badge>}
      </Column>
      <Column id="zeit" label={wortlaut.spalteZeit} value={(z) => new Date(z.meldung.gekommen)} sortable={false} />
      <Column value="dauer" label={wortlaut.spalteDauer} numeric sortable={false}>
        {(ms) => dauerWort(ms)}
      </Column>
      <Column value="haeufigkeit" label={wortlaut.spalteHaeufigkeit} format="anzahl" sortable={false} />
    </Table>
  );
}
