/* Ticket 02 - Messungen. Jede Messung laeuft fuer alle drei Arten und
   schreibt ihr Ergebnis in eine Tabelle, die am Ende ausgegeben wird. Die
   Behauptungen stehen nur dort, wo die empfohlene Art ("render") eine
   Zusage macht; fuer die anderen wird gemessen, nicht verlangt. */

import { StrictMode, useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { act, render, cleanup } from "@testing-library/react";
import { writeFileSync } from "node:fs";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import { useTabelle } from "./prototyp";
import type { Abo, Art, Tabelle } from "./prototyp";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(cleanup);

interface Z {
  name: string;
  menge: number;
  ort: string;
}
const ZEILEN: Z[] = [
  { name: "Basalt", menge: 2, ort: "Nord" },
  { name: "Aurora", menge: 1, ort: "Süd" },
];
const ARTEN: Art[] = ["effekt", "layout", "render"];

const ergebnisse: Record<string, Record<Art, string | number>> = {};
const notiere = (messung: string, art: Art, wert: string | number) => {
  (ergebnisse[messung] ??= {} as Record<Art, string | number>)[art] = wert;
};
afterAll(() => {
  writeFileSync(`${import.meta.dirname}/messwerte.json`, JSON.stringify(ergebnisse, null, 2) + "\n");
});

const koepfe = (wurzel: ParentNode) => Array.from(wurzel.querySelectorAll("th")).map((th) => th.textContent);

let aussen: { t: Tabelle<Z>; tick: (n: number) => void; zeigeOrt: (b: boolean) => void } | null = null;

function MengenSpalte({ of }: { of: Tabelle<Z> }) {
  const [einheit, setEinheit] = useState("St.");
  const { Column } = of;
  return (
    <>
      <button onClick={() => setEinheit("kg")}>einheit</button>
      <Column value="menge" label={`Menge (${einheit})`}>
        {(m: number) => `${m} ${einheit}`}
      </Column>
    </>
  );
}

function App({ art, abo, huelle = false, probe }: { art: Art; abo?: Abo; huelle?: boolean; probe?: ReactNode }) {
  const [tick, setTick] = useState(0);
  const [ort, setOrt] = useState(false);
  const t = useTabelle(ZEILEN, art, abo);
  aussen = { t, tick: setTick, zeigeOrt: setOrt };
  const { Table, Column } = t;
  return (
    <>
      <Table>
        <Column value="name" label="Name" />
        {ort && <Column value="ort" label="Ort" />}
        {huelle ? (
          <MengenSpalte of={t} />
        ) : (
          <Column value="menge" label="Menge">
            {(m: number) => `${m} St. #${tick}`}
          </Column>
        )}
      </Table>
      {probe}
    </>
  );
}

describe.each(ARTEN)("Art %s", (art) => {
  it("Identitaet: Spalten werden bei Neurendern des Aufrufers nicht neu montiert", () => {
    render(<App art={art} />);
    const vorher = aussen!.t.zaehler.montiert;
    for (let i = 1; i <= 5; i++) act(() => aussen!.tick(i));
    notiere("Montagen nach 5 Neurendern (2 Spalten)", art, aussen!.t.zaehler.montiert);
    expect(aussen!.t.zaehler.montiert).toBe(vorher);
  });

  it.each(["layout", "extern"] as const)("Erstes Bild (Abo %s): Spalten am Ende der ersten Aufgabe, vor jedem weiteren Takt", async (abo) => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
    const behaelter = document.createElement("div");
    document.body.append(behaelter);
    const bilder: number[] = [];
    const protokoll: string[] = [];
    (globalThis as { __protokoll?: string[] }).__protokoll = protokoll;
    function Probe() {
      useLayoutEffect(() => {
        /* Eine Mikroaufgabe laeuft nach der Festschreibung und nach React's
           synchroner Nacharbeit, aber vor jedem Makro-Takt - also vor dem
           Malen und vor den passiven Effekten. */
        queueMicrotask(() => {
          bilder.push(behaelter.querySelectorAll("th").length);
          protokoll.push("Mikroaufgabe nach der ersten Festschreibung");
        });
      }, []);
      return null;
    }
    const wurzel = createRoot(behaelter);
    wurzel.render(<App art={art} abo={abo} probe={<Probe />} />);
    await new Promise((r) => setTimeout(r, 50));
    const endstand = behaelter.querySelectorAll("th").length;
    notiere(`Kopfzellen im ersten Bild / am Ende (Abo ${abo})`, art, `${bilder[0]} / ${endstand}`);
    const erste = protokoll.indexOf("Mikroaufgabe nach der ersten Festschreibung");
    notiere(`Passive Effekte vor der Mikroaufgabe (Abo ${abo})`, art, protokoll.slice(0, erste).length);
    delete (globalThis as { __protokoll?: string[] }).__protokoll;
    wurzel.unmount();
    behaelter.remove();
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    if (art === "render" || (art === "layout" && abo === "layout")) expect(bilder[0]).toBe(2);
  });

  it("Durchlaeufe: Koerper-Renders je Neurendern des Aufrufers (inline children)", () => {
    render(<App art={art} />);
    const vorher = aussen!.t.zaehler.koerper;
    act(() => aussen!.tick(1));
    const je = aussen!.t.zaehler.koerper - vorher;
    notiere("Koerper-Renders je Aufrufer-Update", art, je);
    if (art === "render") expect(je).toBe(1);
  });

  it("Durchlaeufe mit Huelle: Aufrufer-Update und eigenes Update der Huelle", () => {
    const { getByText, container } = render(<App art={art} huelle />);
    let vorher = aussen!.t.zaehler.koerper;
    act(() => aussen!.tick(1));
    const aufrufer = aussen!.t.zaehler.koerper - vorher;
    vorher = aussen!.t.zaehler.koerper;
    act(() => getByText("einheit").click());
    const eigen = aussen!.t.zaehler.koerper - vorher;
    notiere("Huelle: Koerper-Renders Aufrufer / Huelle", art, `${aufrufer} / ${eigen}`);
    expect(koepfe(container)).toEqual(["Name", "Menge (kg)"]);
    expect(container.querySelector("tbody td:last-child")?.textContent).toBe("2 kg");
  });

  it("Reihenfolge: eine Spalte, die in der Mitte dazukommt", () => {
    const { container } = render(<App art={art} />);
    act(() => aussen!.zeigeOrt(true));
    notiere("Einschub in der Mitte", art, koepfe(container).join(","));
    expect(koepfe(container)).toEqual(["Name", "Ort", "Menge"]);
  });

  it("Strict Mode: doppeltes Montieren, dann Verstecken und Umordnen", () => {
    const { container } = render(
      <StrictMode>
        <App art={art} />
      </StrictMode>,
    );
    const anfang = koepfe(container).join(",");
    act(() => aussen!.t.setReihenfolge(["menge", "name"]));
    const umgeordnet = koepfe(container).join(",");
    act(() => aussen!.t.setVersteckt(["name"]));
    const versteckt = koepfe(container).join(",");
    act(() => aussen!.zeigeOrt(true));
    const eingeschoben = koepfe(container).join(",");
    notiere("Strict: Anfang | umgeordnet | versteckt | Einschub", art, `${anfang} | ${umgeordnet} | ${versteckt} | ${eingeschoben}`);
    expect(anfang).toBe("Name,Menge");
    expect(umgeordnet).toBe("Menge,Name");
    expect(versteckt).toBe("Menge");
    expect(eingeschoben).toBe("Menge,Ort");
  });

  it("Sortierung liest die Werte der gemeldeten Spalten", () => {
    const { container } = render(<App art={art} />);
    act(() => aussen!.t.setSortierung({ spalte: "name", richtung: 1 }));
    const erste = container.querySelector("tbody td")?.textContent;
    notiere("Erste Zeile nach Sortierung", art, String(erste));
    expect(erste).toBe("Aurora");
  });
});
