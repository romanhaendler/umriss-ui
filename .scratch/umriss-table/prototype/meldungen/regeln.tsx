/* Jede Regel aus "Binding the row type" und "A column": ein Aufruf, der
   uebersetzt, und einer, der es nicht darf. */

import { Badge, Search, spalte, useTabelle } from "./api";
import type { Tabelle } from "./api";

interface Auftrag {
  id: string;
  nummer: string;
  status: "Aktiv" | "Pausiert";
  menge: number;
  preis: number | null;
  termin: Date;
  eilig: boolean;
  tags: string[];
  kunde: { name: string };
}

interface Messung {
  id: string;
  messwert: number;
}

declare const auftraege: Auftrag[];
declare const messungen: Messung[];

export function Regeln() {
  const t = useTabelle(auftraege, { rowKey: (a) => a.id });
  const { Table, Column } = t;
  const m = useTabelle(messungen, { rowKey: (z) => z.id });

  /* Presets: an eine Eigenschaft gebunden, nicht an eine Zeilenart. */
  const menge = spalte<{ menge: number }>({ value: "menge", label: "Menge", footer: "sum" });
  const textMenge = spalte<{ menge: string }>({ value: "menge", label: "Menge" });
  /* Mit zwei Feldern ist der Feldname nicht mehr abzuleiten: TypeScript kennt
     keine teilweise Ableitung von Typargumenten. Er wird dann mitgenannt. */
  const zweiFelder = spalte<{ menge: number; nummer: string }, "menge">({ value: "menge", label: "Menge", footer: "sum" });

  return (
    <>
      <Table>
        {/* R1 Der Zeilentyp kommt aus den Zeilen: ein Feldname wird geprueft. */}
        <Column value="nummer" label="Auftrag" />
        {/* NOTIZ R1 vertippter Feldname */}
        <Column value="numer" label="Auftrag" />

        {/* R2 Wert als Funktion verlangt eine id. */}
        <Column id="kunde" value={(a) => a.kunde.name} label="Kunde" />
        {/* NOTIZ R2 berechneter Wert ohne id */}
        <Column value={(a) => a.kunde.name} label="Kunde" />

        {/* R3 children bekommt den Typ des Feldes, ohne das Fehlende. */}
        <Column value="status" label="Status">
          {(status) => <Badge tone={status === "Aktiv" ? "success" : "warning"}>{status}</Badge>}
        </Column>
        <Column value="preis" label="Preis">
          {(preis) => preis.toFixed(2)}
        </Column>
        {/* NOTIZ R3 Zahlenmethode auf Text */}
        <Column value="nummer" label="Nummer" children={(nummer) => nummer.toFixed(2)} />
        {/* NOTIZ R3 berechneter Text, Zahlenmethode */}
        <Column id="k" value={(a) => a.kunde.name} label="Kunde" children={(n) => n.toFixed(2)} />
        {/* R3 der zweite Parameter ist die Zeile */}
        <Column value="menge" label="Menge">
          {(wert, zeile) => `${wert} ${zeile.nummer}`}
        </Column>

        {/* R4 Ohne Textform ist children Pflicht. */}
        <Column value="tags" label="Tags">
          {(tags) => tags.join(", ")}
        </Column>
        {/* NOTIZ R4 Array ohne children */}
        <Column value="tags" label="Tags" />
        <Column id="kundeObj" value={(a) => a.kunde} label="Kunde">
          {(kunde) => kunde.name}
        </Column>
        {/* NOTIZ R4 berechnetes Objekt ohne children */}
        <Column id="kundeObj2" value={(a) => a.kunde} label="Kunde" />
        {/* R4 Text, Zahl, Datum, Wahrheitswert brauchen keines */}
        <Column value="termin" label="Termin" />
        <Column value="eilig" label="Eilig" />

        {/* R5 format nach Name, am Werttyp geprueft. */}
        <Column value="menge" label="Menge" format="prozent" />
        <Column value="menge" label="Menge" format={{ nachkomma: 2 }} />
        <Column value="termin" label="Termin" format="datum" />
        {/* NOTIZ R5 Datumsformat auf Zahl */}
        <Column value="menge" label="Menge" format="datum" />
        {/* NOTIZ R5 Zahlformat auf Datum */}
        <Column value="termin" label="Termin" format="prozent" />
        {/* NOTIZ R5 format auf Text */}
        <Column value="nummer" label="Nummer" format="prozent" />
        <Column id="netto" value={(a) => a.menge * 0.81} label="Netto" format={{ nachkomma: 2 }} />
        {/* NOTIZ R5 Datumsformat auf berechnete Zahl */}
        <Column id="netto2" value={(a) => a.menge * 0.81} label="Netto" format="datum" />
        <Column id="faellig" value={(a) => a.termin} label="Fällig" format="zeit" />

        {/* R6 footer nur fuer Zahlen. */}
        <Column value="menge" label="Menge" footer="sum" />
        <Column value="preis" label="Preis" footer="avg" />
        {/* NOTIZ R6 Summe auf Text */}
        <Column value="nummer" label="Nummer" footer="sum" />
        {/* NOTIZ R6 Summe auf Datum */}
        <Column value="termin" label="Termin" footer="sum" />
        <Column id="wert" value={(a) => a.menge * (a.preis ?? 0)} label="Wert" footer="sum" />
        {/* NOTIZ R6 Summe auf berechnetem Text */}
        <Column id="name" value={(a) => a.kunde.name} label="Name" footer="sum" />

        {/* R7 label ist Pflicht. */}
        {/* NOTIZ R7 ohne label */}
        <Column value="nummer" />

        {/* R8 Presets: angenommen fuer Zeilen mit der Eigenschaft, abgelehnt ohne, ueberschreibbar. */}
        <Column {...menge} />
        <Column {...menge} label="Stück" />
        <Column {...zweiFelder} />
        {/* NOTIZ R8 Preset auf Zeilen, deren menge Text ist */}
        <m.Column {...textMenge} />
        {/* NOTIZ R8 Preset auf Zeilen ohne menge */}
        <m.Column {...menge} />

        {/* R9 Ein Renderer, der eine andere Zeilenart erwartet. */}
        {/* NOTIZ R9 Zeile der falschen Art */}
        <Column value="menge" label="Menge" children={(wert: number, zeile: Messung) => zeile.messwert + wert} />

        {/* R10 Huellen bekommen die Tabelle als `of`. */}
        <GenerischeMenge of={t} />
        <MengenSpalte of={t} />
        {/* NOTIZ R10 Huelle fuer eine andere Zeilenart */}
        <MengenSpalte of={m} />

        {/* R11 Eine Spalte aus einem anderen Haken ist typisch KEIN Fehler -
            JSX prueft Kinder nicht gegen die Eltern. Siehe Befunde. */}
        <m.Column value="messwert" label="Messwert" />
      </Table>

      {/* R12 Freie Bausteine ausserhalb der Tabelle nehmen `of`. */}
      <Search of={t} />
    </>
  );
}

/** Eine Huelle mit fester Zeilenart. */
function MengenSpalte({ of }: { of: Tabelle<Auftrag> }) {
  const { Column } = of;
  return <Column value="menge" label="Menge" footer="sum" />;
}

/** Eine generische Huelle ueber jede Zeile mit Menge - geht NICHT: in einem
    generischen Rumpf bleiben `Feld<Z>` und die bedingten Typen offen, und der
    Compiler kann "menge" nicht als Feld von Z bestaetigen. Der Weg fuer eine
    Spalte, die zu vielen Zeilenarten passt, ist das Preset. Siehe Befunde. */
export function GenerischeMenge<Z extends { menge: number }>({ of }: { of: Tabelle<Z> }) {
  const { Column } = of;
  // NOTIZ R10 generische Huelle
  return <Column value="menge" label="Menge" footer="sum" />;
}

/* R13 Sammelaktion bekommt eine Liste, Zeilenaktion eine Zeile. */
export function Aktionen() {
  const { Action } = useTabelle(auftraege, { rowKey: (a) => a.id });
  return (
    <>
      <Action onSelect={(a) => a.nummer}>Öffnen</Action>
      <Action bulk onSelect={(liste) => liste.map((a) => a.nummer)}>Archivieren</Action>
      {/* NOTIZ R13 Zeilenaktion behandelt eine Liste */}
      <Action onSelect={(liste) => liste.map((a) => a.nummer)}>Öffnen</Action>
      {/* NOTIZ R13 Sammelaktion behandelt eine Zeile */}
      <Action bulk onSelect={(a) => a.nummer}>Archivieren</Action>
    </>
  );
}

/* R14 Urteilsspalte nur ueber Zahlenfeldern. */
export function Urteile() {
  const { VerdictColumn } = useTabelle(auftraege, { rowKey: (a) => a.id });
  return (
    <>
      <VerdictColumn value="preis" label="Preis" limits={{}} />
      {/* NOTIZ R14 Urteil ueber Text */}
      <VerdictColumn value="nummer" label="Nummer" limits={{}} />
    </>
  );
}
