/* Variante E: Ueberladungen, die sich durch PFLICHT-Eigenschaften unterscheiden,
   damit eine unpassende schon im ersten Durchgang ausscheidet - bevor sie die
   Parameter von children festlegt. */
import type { ReactNode } from "react";
import type { Darstellung, DatumFormat, Fehlend, Feld, FeldSpalte, KinderFuer, SpaltenGrund, ZahlFormat } from "../typen/api";

interface A { id: string; name: string; menge: number; tags: string[]; termin: Date; preis: number | null }

type Ber<Z, W> = SpaltenGrund & { id: string; value: (z: Z) => W };

interface Spalte<Z> {
  <K extends Feld<Z>>(props: FeldSpalte<Z, K>): ReactNode;
  <W extends number | Fehlend>(props: Ber<Z, W> & { footer: "sum" | "avg"; format?: ZahlFormat; children?: Darstellung<W, Z> }): ReactNode;
  <W extends number | Fehlend>(props: Ber<Z, W> & { format: ZahlFormat; children?: Darstellung<W, Z> }): ReactNode;
  <W extends Date | Fehlend>(props: Ber<Z, W> & { format: DatumFormat; children?: Darstellung<W, Z> }): ReactNode;
  <W>(props: Ber<Z, W> & { footer?: never; format?: never } & KinderFuer<W, Z>): ReactNode;
}
declare const S: Spalte<A>;

export const e = (
  <>
    <S value="name" label="x">{(n) => n.toUpperCase()}</S>
    <S value="preis" label="x">{(n) => n.toFixed()}</S>
    <S id="k" value={(a) => a.name} label="x">{(n) => n.toUpperCase()}</S>
    <S id="t" value={(a) => a.tags} label="x">{(t) => t.join()}</S>
    <S id="o" value={(a) => ({ x: a.name })} label="x">{(o) => o.x}</S>
    <S id="n" value={(a) => a.menge} label="x">{(n) => n.toFixed()}</S>
    <S id="s" value={(a) => a.menge * 2} label="x" footer="sum" />
    <S id="s3" value={(a) => a.preis} label="x" footer="sum">{(n) => n.toFixed()}</S>
    <S id="f" value={(a) => a.menge * 2} label="x" format="prozent" />
    <S id="f2" value={(a) => a.menge * 2} label="x" format="prozent" footer="avg">{(n) => n.toFixed()}</S>
    <S id="d" value={(a) => a.termin} label="x" format="zeit" />
    <S id="d2" value={(a) => a.termin} label="x" format="zeit">{(d) => d.getFullYear()}</S>
    <S id="d3" value={(a) => a.termin} label="x">{(d) => d.getFullYear()}</S>
    {/* @ts-expect-error Summe auf Text */}
    <S id="s2" value={(a) => a.name} label="x" footer="sum" />
    {/* @ts-expect-error Datumsformat auf Zahl */}
    <S id="f3" value={(a) => a.menge} label="x" format="zeit" />
    {/* @ts-expect-error Zahlformat auf Text */}
    <S id="f4" value={(a) => a.name} label="x" format="prozent" />
    {/* @ts-expect-error ohne id */}
    <S value={(a) => a.name} label="x" />
    {/* @ts-expect-error Array ohne children */}
    <S id="t2" value={(a) => a.tags} label="x" />
    {/* @ts-expect-error Zahlenmethode auf Text */}
    <S id="k2" value={(a) => a.name} label="x" children={(n) => n.toFixed()} />
    {/* @ts-expect-error falscher Feldname */}
    <S value="nam" label="x" />
  </>
);
