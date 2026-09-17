/* Wie bekommt ein berechneter Wert zugleich typisierte children, format und footer? */
import type { ReactNode } from "react";
import type { Da, Feld, FormatFuer, FussFuer, KinderFuer, SpaltenGrund } from "../typen/api";

interface A { id: string; name: string; menge: number; tags: string[]; termin: Date }

/* Variante C: eine Signatur, V ist Feldname oder Funktion. */
type WertVon<Z, V> = V extends Feld<Z> ? Z[V] : V extends (z: Z) => infer R ? R : never;
type C<Z, V> = SpaltenGrund & { value: V; format?: FormatFuer<WertVon<Z, V>>; footer?: FussFuer<WertVon<Z, V>> }
  & (V extends Feld<Z> ? { id?: string } : { id: string })
  & KinderFuer<WertVon<Z, V>, Z>;
declare function SpalteC<V extends Feld<A> | ((z: A) => unknown)>(props: C<A, V>): ReactNode;

/* Variante D: wie C, aber footer/format per NoInfer. */
type D<Z, V> = SpaltenGrund & { value: V; format?: NoInfer<FormatFuer<WertVon<Z, V>>>; footer?: NoInfer<FussFuer<WertVon<Z, V>>> }
  & (V extends Feld<Z> ? { id?: string } : { id: string })
  & KinderFuer<WertVon<Z, V>, Z>;
declare function SpalteD<V extends Feld<A> | ((z: A) => unknown)>(props: D<A, V>): ReactNode;

export const c = (
  <>
    <SpalteC value="name" label="x">{(n) => n.toUpperCase()}</SpalteC>
    <SpalteC id="k" value={(a) => a.name} label="x">{(n) => n.toUpperCase()}</SpalteC>
    <SpalteC id="t" value={(a) => a.tags} label="x">{(t) => t.join()}</SpalteC>
    <SpalteC id="s" value={(a) => a.menge * 2} label="x" footer="sum" />
    <SpalteC id="f" value={(a) => a.menge * 2} label="x" format="prozent" />
    <SpalteC id="f2" value={(a) => a.menge * 2} label="x" format="prozent" footer="avg">{(n) => n.toFixed()}</SpalteC>
    <SpalteC id="d" value={(a) => a.termin} label="x" format="zeit" />
    {/* @ts-expect-error Summe auf Text */}
    <SpalteC id="s2" value={(a) => a.name} label="x" footer="sum" />
    {/* @ts-expect-error ohne id */}
    <SpalteC value={(a) => a.name} label="x" />
    {/* @ts-expect-error Array ohne children */}
    <SpalteC id="t2" value={(a) => a.tags} label="x" />
    {/* @ts-expect-error falscher Feldname */}
    <SpalteC value="nam" label="x" />
  </>
);

export const d = (
  <>
    <SpalteD id="s" value={(a) => a.menge * 2} label="x" footer="sum" />
    <SpalteD id="f" value={(a) => a.menge * 2} label="x" format="prozent" />
    {/* @ts-expect-error Summe auf Text */}
    <SpalteD id="s2" value={(a) => a.name} label="x" footer="sum" />
  </>
);
