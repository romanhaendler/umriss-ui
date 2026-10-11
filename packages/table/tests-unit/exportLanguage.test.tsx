/* The CSV follows the language in use (table-export-by-language 01): the
   decimal mark and the words for true and false come from the formats and the
   wording, the separator from the mark. Mounted, with `onExport`. */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@umriss-ui/core";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { Export, Toolbar, useTable } from "../src";
import type { Table } from "../src";

interface Part {
  id: string;
  name: string;
  weight: number;
  ok: boolean;
}

const PARTS: Part[] = [
  { id: "a", name: "Bolt, long", weight: 3.5, ok: true },
  { id: "b", name: "Nut", weight: 2, ok: false },
];

let current: Table<Part> | null = null;
const capture = (t: Table<Part>) => {
  current = t;
};

function Parts({ onExport }: { onExport?: (text: string) => void }) {
  const t = useTable(PARTS, { rowKey: (p) => p.id });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame ariaLabel="Parts">
      <Toolbar>
        <Export onExport={onExport} />
      </Toolbar>
      <Column value="name" label="Name" rowHeader />
      <Column value="weight" label="Weight" />
      <Column value="ok" label="Fine" />
    </Frame>
  );
}

const run = (language?: { wording?: typeof GERMAN_WORDING; formats?: typeof GERMAN_FORMATS }) => {
  const onExport = vi.fn();
  const ui = <Parts onExport={onExport} />;
  render(language ? <LanguageProvider {...language}>{ui}</LanguageProvider> : ui);
  fireEvent.click(screen.getByRole("button", { name: /Export/ }));
  return String(onExport.mock.calls[0]![0]).replace("﻿", "").split("\r\n");
};

describe("Export follows the language", () => {
  it("writes commas, a decimal point and yes/no by default", () => {
    expect(run()).toEqual(["Name,Weight,Fine", '"Bolt, long",3.5,yes', "Nut,2,no"]);
  });

  it("writes the file it always wrote under German wording and formats", () => {
    expect(run({ wording: GERMAN_WORDING, formats: GERMAN_FORMATS })).toEqual([
      "Name;Weight;Fine",
      "Bolt, long;3,5;ja",
      "Nut;2;nein",
    ]);
  });

  it("mixes German words with a point and commas when only the wording is German", () => {
    expect(run({ wording: GERMAN_WORDING })).toEqual(["Name,Weight,Fine", '"Bolt, long",3.5,ja', "Nut,2,nein"]);
  });

  it("takes a semicolon where a replaced number format writes a comma", () => {
    const formats = { ...GERMAN_FORMATS, number: (n: number) => String(n).replace(".", ",") };
    expect(run({ formats })[0]).toBe("Name;Weight;Fine");
  });

  it("gives asCsv() the English text without a provider", () => {
    render(<Parts />);
    expect(current!.asCsv()).toBe('﻿Name,Weight,Fine\r\n"Bolt, long",3.5,yes\r\nNut,2,no');
  });
});
