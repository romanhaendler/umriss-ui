/* CSV export (table-surface 01). The guarantee is twofold: the text can be read
   back in mechanically (separators, quotation marks and line breaks inside
   values cannot tear it apart), and it comes from the filtered set, not from the
   visible page. */

import { describe, expect, it } from "vitest";
import { asCsv, asTabbed } from "../src/model/csv";
import type { CsvConventions } from "../src/model/csv";
import { column, tableModel } from "../src/model/tableModel";

interface Row {
  id: string;
  project: string;
  budget: number;
}

const ROWS: Row[] = [
  { id: "p1", project: "Aurora", budget: 300 },
  { id: "p2", project: "Basalt", budget: 100 },
  { id: "p3", project: "Cirrus", budget: 200 },
  { id: "p4", project: "Dorado", budget: 100 },
];

const PROJECT = column<Row>("projekt", { label: "Projekt", value: (z) => z.project });
const BUDGET = column<Row>("budget", { label: "Budget", value: (z) => z.budget });
const COLUMNS = [PROJECT, BUDGET];

/* The text carries a byte order mark, so that German Excel opens it as UTF-8
   without an import dialog. For the assertions it is in the way. */
/* Spelled out: the German file is the one the table wrote before conventions
   followed the language, byte for byte. */
const GERMAN: CsvConventions = { separator: ";", decimal: ",", yes: "ja", no: "nein" };

const withoutBom = (text: string) => text.replace(/^﻿/, "");
const lines = (text: string) => withoutBom(text).split("\r\n");

describe("asCsv – structure", () => {
  it("writes the column labels as the header row", () => {
    expect(lines(asCsv(ROWS, COLUMNS))[0]).toBe("Projekt,Budget");
  });

  it("falls back to the column id when there is no label", () => {
    const withoutLabel = [column<Row>("projekt", { value: (z) => z.project })];
    expect(lines(asCsv(ROWS, withoutLabel))[0]).toBe("projekt");
  });

  it("begins with a byte order mark", () => {
    expect(asCsv(ROWS, COLUMNS).startsWith("﻿")).toBe(true);
  });

  it("separates rows with CRLF", () => {
    expect(withoutBom(asCsv(ROWS, COLUMNS))).toContain("\r\n");
  });

  it("writes one line per record, in the order passed in", () => {
    const out = lines(asCsv(ROWS, COLUMNS));
    expect(out).toHaveLength(5); // header + four rows
    expect(out[1]).toBe("Aurora,300");
    expect(out[4]).toBe("Dorado,100");
  });

  it("writes only the columns passed in, in their order", () => {
    const reversed = [BUDGET, PROJECT];
    expect(lines(asCsv(ROWS, reversed))[0]).toBe("Budget,Projekt");
    expect(lines(asCsv(ROWS, reversed))[1]).toBe("300,Aurora");
  });

  it("writes only the header row when there are no records", () => {
    expect(lines(asCsv([], COLUMNS))).toEqual(["Projekt,Budget"]);
  });
});

describe("asCsv – values that could tear the text apart", () => {
  const withValue = (value: string | number) =>
    lines(asCsv([{ id: "x", project: String(value), budget: 0 }], [PROJECT]))[1];

  it("quotes values containing the separator", () => {
    expect(withValue("Nord,Sued")).toBe('"Nord,Sued"');
  });

  it("doubles quotation marks and quotes the value", () => {
    expect(withValue('Projekt "Aurora"')).toBe('"Projekt ""Aurora"""');
  });

  it("quotes values containing a line break", () => {
    expect(withValue("Zeile1\nZeile2")).toBe('"Zeile1\nZeile2"');
  });

  it("quotes values containing a carriage return", () => {
    /* Checked on the raw text: a value with CRLF cannot be checked by splitting
       at CRLF - the splitting is precisely what the quotation marks protect the
       value from. */
    const raw = withoutBom(asCsv([{ id: "x", project: "Zeile1\r\nZeile2", budget: 0 }], [PROJECT]));
    expect(raw).toBe('Projekt\r\n"Zeile1\r\nZeile2"');
  });

  it("leaves harmless values untouched", () => {
    expect(withValue("Aurora")).toBe("Aurora");
  });

  it("writes an empty value as an empty field", () => {
    expect(withValue("")).toBe("");
  });

  it("treats absent values like empty ones", () => {
    const withoutValue = [column<Row>("projekt", {})];
    expect(lines(asCsv(ROWS, withoutValue))[1]).toBe("");
  });
});

describe("asCsv – the language's notation", () => {
  const budget = (value: number, c?: CsvConventions) =>
    lines(asCsv([{ id: "x", project: "", budget: value }], [BUDGET], c))[1];

  it("writes the decimal point in English and the comma in German", () => {
    expect(budget(1234.56)).toBe("1234.56");
    expect(budget(1234.56, GERMAN)).toBe("1234,56");
  });

  it("does not group thousands", () => {
    // A thousands mark would be a second separator inside the field - the value
    // would stay readable, but only by luck.
    expect(budget(1234567)).toBe("1234567");
    expect(budget(1234567, GERMAN)).toBe("1234567");
  });

  it("writes whole numbers without decimals", () => {
    expect(budget(300)).toBe("300");
  });

  it("writes negative numbers with a sign", () => {
    expect(budget(-12.5)).toBe("-12.5");
    expect(budget(-12.5, GERMAN)).toBe("-12,5");
  });

  it("writes the zero", () => {
    expect(budget(0)).toBe("0");
  });

  it("leaves an exponent form as it is", () => {
    expect(budget(1e-7, GERMAN)).toBe("1e-7");
  });
});

/* One fixture, both languages: a decimal, a text holding each separator, a
   quote, a newline, a boolean and an absent value. */
describe("asCsv – one fixture in two languages", () => {
  interface Item {
    name: string | null;
    amount: number;
    done: boolean;
  }
  const items: Item[] = [
    { name: "a,b", amount: 3.5, done: true },
    { name: "c;d", amount: 2, done: false },
    { name: 'say "hi"\nthere', amount: 0.25, done: true },
    { name: null, amount: 1, done: false },
  ];
  const columns = [
    column<Item>("name", { label: "Name", value: (i) => i.name }),
    column<Item>("amount", { label: "Amount", value: (i) => i.amount }),
    { id: "done", label: "Done", value: (i: Item) => i.done },
  ];

  it("writes English by default", () => {
    expect(asCsv(items, columns)).toBe(
      '\uFEFFName,Amount,Done\r\n"a,b",3.5,yes\r\nc;d,2,no\r\n"say ""hi""\nthere",0.25,yes\r\n,1,no',
    );
  });

  it("writes German byte for byte as the table did before", () => {
    expect(asCsv(items, columns, GERMAN)).toBe(
      '\uFEFFName;Amount;Done\r\na,b;3,5;ja\r\n"c;d";2;nein\r\n"say ""hi""\nthere";0,25;ja\r\n;1;nein',
    );
  });

  it("writes the same rows as tabbed text with the language's decimal mark", () => {
    const tabbed = asTabbed(items, columns, GERMAN);
    expect(tabbed).toBe('Name\tAmount\tDone\na,b\t3,5\tja\nc;d\t2\tnein\n"say ""hi""\nthere"\t0,25\tja\n\t1\tnein');
    expect(asTabbed(items, columns).split("\n")[1]).toBe("a,b\t3.5\tyes");
  });

  it("quotes a field holding a tab and writes no trailing break", () => {
    const text = asTabbed([{ name: "x\ty", amount: 1, done: true }], columns);
    expect(text).toBe('Name\tAmount\tDone\n"x\ty"\t1\tyes');
  });
});

describe("asCsv – the filtered set, not the visible page", () => {
  it("takes in every match, including those on later pages", () => {
    /* That is exactly why the function takes the filtered set: the export must
       not depend on which page one is standing on. */
    const projection = tableModel(ROWS, COLUMNS, { pageSize: 2, page: 1 });
    expect(projection.visible).toHaveLength(2);

    const out = lines(asCsv(projection.filtered, COLUMNS));
    expect(out).toHaveLength(5);
    expect(out[4]).toBe("Dorado,100");
  });

  it("follows the sort of the set passed in", () => {
    const projection = tableModel(ROWS, COLUMNS, {
      sort: { column: "budget", direction: "desc" },
    });
    expect(lines(asCsv(projection.filtered, COLUMNS))[1]).toBe("Aurora,300");
  });
});
