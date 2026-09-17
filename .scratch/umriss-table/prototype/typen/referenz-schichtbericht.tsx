/* Referenztabelle 3: Schichtbericht - nur so weit, dass sichtbar wird, ob die
   Spalten-API einer spaeteren Gruppierung im Weg stuende.

   Eine Gruppe braucht zweierlei: einen Schluessel je Zeile und Aggregate je
   Spalte. Der Schluessel ist ein Wert wie jeder andere (eine Spalte oder eine
   Funktion der Zeile), und die Aggregate stehen schon als `footer` an der
   Spalte. Ein `<Group by="schicht" />` stuende deshalb neben `RowDetail` - als
   Baustein aus dem Haken, typisiert gegen `Feld<Z>` - und nicht in den Spalten. */

import { useTabelle } from "./api";
import type { Feld, Tabelle } from "./api";

interface Schichtzeile {
  id: string;
  schicht: "Früh" | "Spät" | "Nacht";
  anlage: string;
  stueck: number;
  ausschuss: number;
  stillstandMin: number | null;
}

/* So saehe der spaetere Baustein aus; hier nur als Typ, um zu zeigen, dass er
   ohne Aenderung an `Column` auskaeme. */
type MitGruppe<Z> = Tabelle<Z> & {
  Group: (props: { by: Feld<Z> | ((zeile: Z) => string) }) => React.ReactNode;
};

export function Schichtbericht({ zeilen }: { zeilen: Schichtzeile[] }) {
  const { Table, Column, Group } = useTabelle(zeilen, { rowKey: (z) => z.id }) as MitGruppe<Schichtzeile>;
  return (
    <Table>
      <Group by="schicht" />
      <Column value="anlage" label="Anlage" rowHeader />
      <Column value="stueck" label="Stück" format="anzahl" footer="sum" />
      <Column value="ausschuss" label="Ausschuss" footer="sum" />
      <Column
        id="quote"
        label="Ausschussquote"
        value={(z) => (z.stueck === 0 ? null : z.ausschuss / z.stueck)}
        format="prozent"
        footer="avg"
      />
      <Column value="stillstandMin" label="Stillstand (min)" footer="sum" />
    </Table>
  );
}
