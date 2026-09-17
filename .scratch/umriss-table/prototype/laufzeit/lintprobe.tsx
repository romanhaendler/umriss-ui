/* Ticket 02 - Lint. Die Formen der echten Schnittstelle, ohne Laufzeit-Sinn:
   Bausteine aus einem Haken, ein Register, in das waehrend des Renderns
   geschrieben wird, und zum Vergleich eine Komponente, die je Render neu
   entsteht. */

import { useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

class Register {
  zeilen: readonly unknown[] = [];
  version = 0;
  eingang(zeilen: readonly unknown[]) {
    if (zeilen !== this.zeilen) {
      this.zeilen = zeilen;
      this.version++;
    }
  }
  abonniere = (f: () => void) => () => void f;
  stand = () => this.version;
}

function erzeuge(register: Register) {
  function Table({ children }: { children: ReactNode }) {
    useSyncExternalStore(register.abonniere, register.stand, register.stand);
    return <table>{children}</table>;
  }
  function Column({ value }: { value: string }) {
    register.eingang([value]);
    return null;
  }
  return { Table, Column };
}

export function useTabelle(zeilen: readonly unknown[]) {
  const [register] = useState(() => new Register());
  register.eingang(zeilen);
  const [bausteine] = useState(() => erzeuge(register));
  return { ...bausteine, anzahl: zeilen.length };
}

export function Destrukturiert() {
  const { Table, Column } = useTabelle([1, 2]);
  return (
    <Table>
      <Column value="x" />
    </Table>
  );
}

export function UeberPunkt() {
  const t = useTabelle([1, 2]);
  return (
    <t.Table>
      <t.Column value="x" />
    </t.Table>
  );
}

export function JeRenderNeu() {
  const Table = ({ children }: { children: ReactNode }) => <table>{children}</table>;
  return <Table>x</Table>;
}
