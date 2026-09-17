/* CSV export (table-surface 01). The guarantee is twofold: the text can be read
   back in mechanically (separators, quotation marks and line breaks inside
   values cannot tear it apart), and it comes from the filtered set, not from the
   visible page. */

import { describe, expect, it } from "vitest";
import { asCsv } from "../src/model/csv";
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
const withoutBom = (text: string) => text.replace(/^﻿/, "");
const lines = (text: string) => withoutBom(text).split("\r\n");

describe("asCsv – structure", () => {
  it("writes the column labels as the header row", () => {
    expect(lines(asCsv(ROWS, COLUMNS))[0]).toBe("Projekt;Budget");
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
    expect(out[1]).toBe("Aurora;300");
    expect(out[4]).toBe("Dorado;100");
  });

  it("writes only the columns passed in, in their order", () => {
    const reversed = [BUDGET, PROJECT];
    expect(lines(asCsv(ROWS, reversed))[0]).toBe("Budget;Projekt");
    expect(lines(asCsv(ROWS, reversed))[1]).toBe("300;Aurora");
  });

  it("writes only the header row when there are no records", () => {
    expect(lines(asCsv([], COLUMNS))).toEqual(["Projekt;Budget"]);
  });
});

describe("asCsv – values that could tear the text apart", () => {
  const withValue = (value: string | number) =>
    lines(asCsv([{ id: "x", project: String(value), budget: 0 }], [PROJECT]))[1];

  it("quotes values containing a semicolon", () => {
    expect(withValue("Nord;Sued")).toBe('"Nord;Sued"');
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

describe("asCsv – German notation", () => {
  const budget = (value: number) =>
    lines(asCsv([{ id: "x", project: "", budget: value }], [BUDGET]))[1];

  it("writes the decimal comma", () => {
    expect(budget(1234.56)).toBe("1234,56");
  });

  it("does not group thousands", () => {
    // A thousands dot would be a second separator inside the field for the
    // spreadsheet - the value would stay readable, but only by luck.
    expect(budget(1234567)).toBe("1234567");
  });

  it("writes whole numbers without decimals", () => {
    expect(budget(300)).toBe("300");
  });

  it("writes negative numbers with a sign", () => {
    expect(budget(-12.5)).toBe("-12,5");
  });

  it("writes the zero", () => {
    expect(budget(0)).toBe("0");
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
    expect(out[4]).toBe("Dorado;100");
  });

  it("follows the sort of the set passed in", () => {
    const projection = tableModel(ROWS, COLUMNS, {
      sort: { column: "budget", direction: "desc" },
    });
    expect(lines(asCsv(projection.filtered, COLUMNS))[1]).toBe("Aurora;300");
  });
});
