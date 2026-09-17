/* Ticket 01 — die Schnittstelle als Typen, ohne Laufzeit. Wegwerfware.

   Alles hier ist `declare`: gefragt ist nur, ob der Compiler annimmt, was er
   annehmen soll, und ablehnt, was er ablehnen soll. */

import type { ReactNode } from "react";

/* --- Werte ---------------------------------------------------------------- */

export type Fehlend = null | undefined;
/** Der Wert ohne das Fehlende – was `children` bekommt. */
export type Da<W> = Exclude<W, Fehlend>;
/** Was ohne `children` als Text erscheinen kann. */
export type Darstellbar = string | number | boolean | Date;

type IstDarstellbar<W> = [Da<W>] extends [never]
  ? false
  : [Da<W>] extends [Darstellbar]
    ? true
    : false;

export type ZahlFormat = "prozent" | "anzahl" | { nachkomma: number };
export type DatumFormat = "datum" | "zeit" | "datumZeit";

export type FormatFuer<W> = [Da<W>] extends [number]
  ? ZahlFormat
  : [Da<W>] extends [Date]
    ? DatumFormat
    : never;

export type FussFuer<W> = [Da<W>] extends [number] ? "sum" | "avg" : never;

export type Darstellung<W, Z> = (wert: Da<W>, zeile: Z) => ReactNode;

/** Ohne Textform ist `children` Pflicht. */
export type KinderFuer<W, Z> = IstDarstellbar<W> extends true
  ? { children?: Darstellung<W, Z> }
  : { children: Darstellung<W, Z> };

export type Feld<Z> = Extract<keyof Z, string>;

/* --- Spalten -------------------------------------------------------------- */

export interface SpaltenGrund {
  label: string;
  rowHeader?: boolean;
  numeric?: boolean;
  width?: number;
  resizable?: boolean;
  sortable?: boolean;
  searchable?: boolean;
  filter?: "list";
}

export type FeldSpalte<Z, K extends Feld<Z>> = SpaltenGrund & {
  value: K;
  id?: string;
  format?: FormatFuer<Z[K]>;
  footer?: FussFuer<Z[K]>;
} & KinderFuer<Z[K], Z>;

/* Berechnete Werte. Die Aufteilung aus der Spec (Further Notes) reicht nicht:
   eine Ueberladung mit OPTIONALEM `footer` passt im ersten Durchgang auf jede
   berechnete Spalte, legt dabei die Parameter von `children` fest (etwa auf
   `number`) und vergiftet so die folgenden Ueberladungen. Die Ueberladungen
   unterscheiden sich deshalb durch PFLICHT-Eigenschaften: eine unpassende
   scheidet aus, bevor ein kontextabhaengiger Ausdruck typisiert wird. */
type Berechnet<Z, W> = SpaltenGrund & { id: string; value: (zeile: Z) => W };

/* Reihenfolge der Ueberladungen: die Feldspalte steht zuletzt, weil TypeScript
   bei keinem Treffer die Meldung der LETZTEN Ueberladung zeigt - und der
   haeufigste Fehler ist ein vertippter Feldname. Die allgemeine berechnete
   Spalte ist zweigeteilt (mit children Pflicht / ohne children nur fuer
   Darstellbares): eine bedingte Pflicht an `children` legt den Werttyp sonst auf
   `unknown` fest, bevor die Funktion gelesen wird. */
export interface SpaltenKomponente<Z> {
  <W extends number | Fehlend>(
    props: Berechnet<Z, W> & { footer: "sum" | "avg"; format?: ZahlFormat; children?: Darstellung<W, Z> },
  ): ReactNode;
  <W extends number | Fehlend>(
    props: Berechnet<Z, W> & { format: ZahlFormat; children?: Darstellung<W, Z> },
  ): ReactNode;
  <W extends Date | Fehlend>(
    props: Berechnet<Z, W> & { format: DatumFormat; children?: Darstellung<W, Z> },
  ): ReactNode;
  <W>(props: Berechnet<Z, W> & { footer?: never; format?: never; children: Darstellung<W, Z> }): ReactNode;
  <W extends Darstellbar | Fehlend>(
    props: Berechnet<Z, W> & { footer?: never; format?: never; children?: never },
  ): ReactNode;
  <K extends Feld<Z>>(props: FeldSpalte<Z, K>): ReactNode;
}

/* --- Grenzwerte (Auszug aus @umriss/ui) ------------------------------------ */

export interface Grenzwert {
  wert: number;
  seite: "oben" | "unten";
  stufe: "warnung" | "alarm";
}
export interface GrenzwertSatz {
  grenzwerte?: readonly Grenzwert[];
  sollwert?: number;
}

export type ZahlFeld<Z> = {
  [K in Feld<Z>]: Z[K] extends number | Fehlend ? K : never;
}[Feld<Z>];

export interface UrteilsSpaltenKomponente<Z> {
  <K extends ZahlFeld<Z>>(props: {
    value: K;
    id?: string;
    label: string;
    limits: GrenzwertSatz;
  }): ReactNode;
  (props: { id: string; value: (zeile: Z) => number | Fehlend; label: string; limits: GrenzwertSatz }): ReactNode;
}

/* --- Zeilen-Beiwerk -------------------------------------------------------- */

export type AktionProps<Z> =
  | { bulk?: false; onSelect: (zeile: Z) => void; children: ReactNode; tone?: "danger" }
  | { bulk: true; onSelect: (zeilen: readonly Z[]) => void; children: ReactNode; tone?: "danger" };

export interface TableProps<Z> {
  selectable?: boolean;
  stickyHeader?: boolean;
  stickyRowHeader?: boolean;
  density?: "regular" | "compact";
  maxHeight?: string;
  empty?: ReactNode;
  loading?: boolean;
  rowProps?: (zeile: Z) => { className?: string } & { [daten: `data-${string}`]: string | undefined };
  "aria-label"?: string;
  children: ReactNode;
}

/* --- Der Haken ------------------------------------------------------------- */

export interface SortierStufe {
  spalte: string;
  richtung: "asc" | "desc";
}

export interface TabelleOptionen<Z> {
  rowKey: (zeile: Z) => string;
  pageSize?: number;
  defaultSort?: SortierStufe | readonly SortierStufe[];
  filter?: (zeile: Z) => boolean;
  initialView?: string;
  virtual?: { rowHeight: number; overscan?: number };
}

/** Was ein Baustein ohne Zeilentyp von einer Tabelle braucht. */
export interface TabellenBezug {
  suche: string;
  setSuche: (suche: string) => void;
  suchparameter: string;
}

export interface Tabelle<Z> extends TabellenBezug {
  Table: (props: TableProps<Z>) => ReactNode;
  Column: SpaltenKomponente<Z>;
  VerdictColumn: UrteilsSpaltenKomponente<Z>;
  RowDetail: (props: { children: (zeile: Z) => ReactNode }) => ReactNode;
  RowActions: (props: { children: ReactNode }) => ReactNode;
  Action: (props: AktionProps<Z>) => ReactNode;
  gefiltert: readonly Z[];
  sichtbar: readonly Z[];
}

export declare function useTabelle<Z>(zeilen: readonly Z[], optionen: TabelleOptionen<Z>): Tabelle<Z>;

/** Voreinstellung einer Spalte, an eine Eigenschaft gebunden statt an eine Zeilenart. */
export declare function spalte<P, K extends Feld<P> = Feld<P>>(vorlage: FeldSpalte<P, K>): FeldSpalte<P, K>;

/* --- Freie Bausteine ------------------------------------------------------- */

export declare function Toolbar(props: { children?: ReactNode }): ReactNode;
export declare function Search(props: { placeholder?: string; of?: TabellenBezug }): ReactNode;
export declare function ColumnMenu(props: { of?: TabellenBezug }): ReactNode;
export declare function Export(props: { filename?: string; onExport?: (text: string) => void; of?: TabellenBezug }): ReactNode;
export declare function Pagination(props: { pageSizes?: readonly number[]; of?: TabellenBezug }): ReactNode;

/* --- Helfer der Referenztabellen ------------------------------------------- */

export declare function Badge(props: { tone?: "neutral" | "success" | "warning" | "danger"; children: ReactNode }): ReactNode;
export declare function Sparkline(props: { data: readonly number[] }): ReactNode;
