/* Referenztabelle 1: Auftragsliste. Suche, Listenfilter, zweistufige
   Sortierung, Auswahl, Zeilen- und Sammelaktion, Blaettern, Ansichtslink. */

import { Badge, ColumnMenu, Export, Pagination, Search, Toolbar, useTabelle } from "./api";

interface Auftrag {
  id: string;
  nummer: string;
  linie: "L1" | "L2" | "L3";
  status: "Aktiv" | "Pausiert";
  menge: number;
  termin: Date;
}

const TON = { Aktiv: "success", Pausiert: "warning" } as const;

declare function oeffnen(a: Auftrag): void;
declare function archivieren(a: readonly Auftrag[]): void;
declare function schreibeAdresse(text: string): void;

export function Auftragsliste({ auftraege, link }: { auftraege: Auftrag[]; link: string }) {
  const t = useTabelle(auftraege, {
    rowKey: (a) => a.id,
    pageSize: 25,
    defaultSort: [
      { spalte: "linie", richtung: "asc" },
      { spalte: "termin", richtung: "desc" },
    ],
    initialView: link,
  });
  const { Table, Column, RowActions, Action } = t;
  schreibeAdresse(t.suchparameter);

  return (
    <Table selectable stickyHeader>
      <Toolbar>
        <Search placeholder="Auftrag suchen" />
        <ColumnMenu />
        <Export filename="auftraege.csv" />
      </Toolbar>

      <Column value="nummer" label="Auftrag" rowHeader />
      <Column value="linie" label="Linie" filter="list" />
      <Column value="status" label="Status" filter="list">
        {(status) => <Badge tone={TON[status]}>{status}</Badge>}
      </Column>
      <Column value="menge" label="Menge" footer="sum" />
      <Column value="termin" label="Termin" format="datum" />

      <RowActions>
        <Action onSelect={(a) => oeffnen(a)}>Öffnen</Action>
        <Action bulk onSelect={(liste) => archivieren(liste)}>Archivieren</Action>
      </RowActions>

      <Pagination />
    </Table>
  );
}
