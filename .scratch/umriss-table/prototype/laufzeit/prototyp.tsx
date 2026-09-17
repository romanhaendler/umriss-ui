/* Ticket 02 - die kleinste Laufzeit, die beantwortet, was der Compiler nicht
   kann. Wegwerfware: kein Stil, kein Modell ausser Sortieren und Verstecken.

   Drei Arten, wie eine Spalte sich meldet:

   - "effekt": in useEffect. Nach dem Malen.
   - "layout": in useLayoutEffect, mit der ganzen Beschreibung (auch den
     Funktionen). Vor dem Malen, aber jede neue children-Funktion ist eine
     Aenderung und kostet einen zweiten Durchlauf.
   - "render": waehrend des Renderns in ein Register geschrieben, das der
     Koerper im selben Durchlauf liest - er steht hinter den Kindern. Ein
     Layout-Effekt meldet nur, was sich an der STRUKTUR geaendert hat. */

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useReducer,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

export type Art = "effekt" | "layout" | "render";

export interface SpaltenProps<Z> {
  id?: string;
  value: string | ((zeile: Z) => unknown);
  label: string;
  children?: (wert: never, zeile: Z) => ReactNode;
}

interface Eintrag {
  schluessel: string;
  id: string;
  label: string;
  lies: (zeile: unknown) => unknown;
  darstellung?: (wert: never, zeile: unknown) => ReactNode;
}

export interface Zaehler {
  koerper: number;
  montiert: number;
}

class Register {
  eintraege = new Map<string, Eintrag>();
  /* Die Schluessel in der Reihenfolge, in der sie im laufenden Durchlauf
     gerendert haben; `null`, solange kein Durchlauf der Tabelle offen ist. */
  lauf: string[] = [];
  /* Letzte bekannte Ordnung - aus dem DOM, nach dem Festschreiben. */
  ordnung: string[] = [];
  version = 0;
  gemeldet = 0;
  zuhoerer = new Set<() => void>();
  kinder: HTMLElement | null = null;
  constructor(readonly art: Art) {}
  zaehler: Zaehler = { koerper: 0, montiert: 0 };

  abonniere = (f: () => void) => {
    this.zuhoerer.add(f);
    return () => {
      this.zuhoerer.delete(f);
    };
  };
  schnappschuss = () => this.version;

  melde() {
    if (this.gemeldet === this.version) return;
    this.gemeldet = this.version;
    for (const f of this.zuhoerer) f();
  }

  beginneLauf() {
    this.lauf = [];
  }

  setze(eintrag: Eintrag, strukturell: boolean) {
    const vorher = this.eintraege.get(eintrag.schluessel);
    this.eintraege.set(eintrag.schluessel, eintrag);
    if (!this.lauf.includes(eintrag.schluessel)) this.lauf.push(eintrag.schluessel);
    const geaendert =
      !vorher ||
      vorher.id !== eintrag.id ||
      vorher.label !== eintrag.label ||
      (!strukturell && (vorher.lies !== eintrag.lies || vorher.darstellung !== eintrag.darstellung));
    if (geaendert) this.version++;
  }

  entferne(schluessel: string) {
    if (this.eintraege.delete(schluessel)) this.version++;
  }

  /** Die Eintraege in JSX-Reihenfolge, so gut sie jetzt bekannt ist. */
  geordnet(): Eintrag[] {
    const bekannt = [...this.eintraege.keys()];
    const quelle =
      this.art === "render" && bekannt.every((s) => this.lauf.includes(s)) ? this.lauf : this.ordnung;
    const reihe = [...quelle.filter((s) => this.eintraege.has(s)), ...bekannt.filter((s) => !quelle.includes(s))];
    return reihe.map((s) => this.eintraege.get(s)!);
  }

  /** Nach dem Festschreiben: die Ordnung aus den Markern im DOM. */
  pruefeOrdnung() {
    if (!this.kinder) return;
    const imDom = Array.from(this.kinder.querySelectorAll<HTMLElement>("[data-spalte]")).map(
      (m) => m.dataset.spalte!,
    );
    if (imDom.join() !== this.ordnung.join()) {
      const vorher = this.geordnet().map((e) => e.schluessel).join();
      this.ordnung = imDom;
      if (vorher !== imDom.join()) this.version++;
    }
  }
}

interface Zustand {
  versteckt: readonly string[];
  reihenfolge: readonly string[];
  sortierung: { spalte: string; richtung: 1 | -1 } | null;
}

export interface Tabelle<Z> {
  Table: (props: { children: ReactNode }) => ReactNode;
  Column: (props: SpaltenProps<Z>) => ReactNode;
  setVersteckt: (ids: readonly string[]) => void;
  setReihenfolge: (ids: readonly string[]) => void;
  setSortierung: (s: Zustand["sortierung"]) => void;
  zaehler: Zaehler;
}

const KoerperKontext = createContext<null | (() => void)>(null);

export type Abo = "extern" | "layout";

export function useTabelle<Z>(zeilen: readonly Z[], art: Art, abo: Abo = "layout"): Tabelle<Z> {
  const [zustand, setZustand] = useState<Zustand>({ versteckt: [], reihenfolge: [], sortierung: null });
  const [register] = useState(() => new Register(art));

  /* Die Eingaenge des Hakens im Register: geschrieben waehrend des Renderns,
     gleicher Eingang ergibt gleichen Stand. Die Tabelle rendert nach dem Haken. */
  const eingang = useRef({ zeilen, zustand });
  // eslint-disable-next-line react-hooks/refs -- genau das wird hier gemessen
  eingang.current = { zeilen, zustand };

  const [bausteine] = useState(() => baue<Z>(register, art, abo, eingang));

  return {
    ...bausteine,
    setVersteckt: (versteckt) => setZustand((z) => ({ ...z, versteckt })),
    setReihenfolge: (reihenfolge) => setZustand((z) => ({ ...z, reihenfolge })),
    setSortierung: (sortierung) => setZustand((z) => ({ ...z, sortierung })),
    zaehler: register.zaehler,
  };
}

function baue<Z>(
  register: Register,
  art: Art,
  abo: Abo,
  eingang: { current: { zeilen: readonly Z[]; zustand: Zustand } },
) {
  function Column(props: SpaltenProps<Z>): ReactNode {
    const schluessel = useId();
    const id = props.id ?? (typeof props.value === "string" ? props.value : "?");
    const feld = props.value;
    const eintrag: Eintrag = {
      schluessel,
      id,
      label: props.label,
      lies: typeof feld === "string" ? (z) => (z as Record<string, unknown>)[feld] : (feld as (z: unknown) => unknown),
      darstellung: props.children as Eintrag["darstellung"],
    };
    if (art === "render") register.setze(eintrag, true);

    useEffect(() => {
      register.zaehler.montiert++;
      (globalThis as { __protokoll?: string[] }).__protokoll?.push("passiver Effekt");
    }, []);

    const wennEffekt = art === "effekt" ? useEffect : useLayoutEffect;
    wennEffekt(() => {
      /* Auch fuer "render": Strict Mode spielt die Effekte beim Montieren
         ab und wieder an, und das Abmelden dazwischen hat den Eintrag
         geloescht. Das Setzen ist gleichbleibend. */
      register.setze(eintrag, art === "render");
      register.pruefeOrdnung();
      register.melde();
    });
    wennEffekt(
      () => () => {
        register.entferne(schluessel);
        register.melde();
      },
      [schluessel],
    );

    return <span hidden data-spalte={schluessel} />;
  }

  /* Zwei Arten zu abonnieren. useSyncExternalStore meldet sich in einem
     PASSIVEN Effekt an: was ein Layout-Effekt beim Montieren meldet, kommt
     erst nach dem Malen an. Die zweite Art meldet sich im Layout-Effekt an
     und vergleicht dabei den Stand. */
  function useStand() {
    const [, erneuere] = useReducer((n: number) => n + 1, 0);
    const gerendert = register.version;
    useLayoutEffect(() => {
      const pruefe = () => {
        if (register.version !== gerendert) erneuere();
      };
      pruefe();
      return register.abonniere(pruefe);
    });
  }

  function Koerper() {
    if (abo === "extern") {
      useSyncExternalStore(register.abonniere, register.schnappschuss, register.schnappschuss);
    } else {
      useStand();
    }
    register.zaehler.koerper++;
    const { zeilen, zustand } = eingang.current;
    let spalten = register.geordnet().filter((s) => !zustand.versteckt.includes(s.id));
    if (zustand.reihenfolge.length) {
      const rang = (id: string) => {
        const i = zustand.reihenfolge.indexOf(id);
        return i === -1 ? Infinity : i;
      };
      spalten = [...spalten].sort((a, b) => rang(a.id) - rang(b.id));
    }
    let reihen = [...zeilen];
    const s = zustand.sortierung;
    const nach = s && register.geordnet().find((e) => e.id === s.spalte);
    if (s && nach) {
      reihen.sort((a, b) => {
        const x = nach.lies(a) as string | number;
        const y = nach.lies(b) as string | number;
        return (x < y ? -1 : x > y ? 1 : 0) * s.richtung;
      });
    }
    return (
      <table>
        <thead>
          <tr>
            {spalten.map((sp) => (
              <th key={sp.schluessel}>{sp.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reihen.map((zeile, i) => (
            <tr key={i}>
              {spalten.map((sp) => {
                const wert = sp.lies(zeile);
                return (
                  <td key={sp.schluessel}>
                    {sp.darstellung
                      ? sp.darstellung(wert as never, zeile)
                      : typeof wert === "number"
                        ? wert.toFixed(1)
                        : String(wert)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function Table({ children }: { children: ReactNode }): ReactNode {
    if (art === "render") register.beginneLauf();
    const kinder = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
      register.kinder = kinder.current;
      register.pruefeOrdnung();
      register.melde();
    });
    return (
      <KoerperKontext.Provider value={null}>
        <div ref={kinder}>{children}</div>
        <Koerper />
      </KoerperKontext.Provider>
    );
  }

  return { Table, Column };
}

/* Nur damit der Kontext nicht als unbenutzt gilt - die echte Tabelle gibt
   ihn an Suche, Spaltenmenue und Blaetterleiste. */
export const useKoerper = () => useContext(KoerperKontext);
