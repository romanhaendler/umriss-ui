import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DEFAULT_FORMATS, DEFAULT_WORDING,LanguageProvider } from "@umriss-ui/core";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { csv } from "../src/export";
import { useTable } from "../src";
import type { Table } from "../src";
import type { ExportSheet } from "../src/types";

const english = { formats: DEFAULT_FORMATS, wording: DEFAULT_WORDING };
const german = { formats: GERMAN_FORMATS, wording: GERMAN_WORDING };
const write = (rows: ExportSheet["rows"], ctx = english) =>
  (csv.write({ columns: [{ label: "Day" }], rows }, ctx) as string).replace("﻿", "").split("\r\n").slice(1);

const zone = process.env.TZ;
afterEach(() => {
  process.env.TZ = zone;
});

describe("the CSV writes a day as its day", () => {
  it.each(["Europe/Berlin", "Asia/Tokyo"])("writes local midnights as YYYY-MM-DD in %s", (tz) => {
    process.env.TZ = tz;
    expect(write([[new Date(2026, 2, 17)], [new Date(2026, 2, 18)]])).toEqual(["2026-03-17", "2026-03-18"]);
  });

  it("writes every date as ISO when one has a time", () => {
    const rows = [[new Date(2026, 2, 17)], [new Date(2026, 2, 18, 13, 45)]];
    expect(write(rows)).toEqual(rows.map(([d]) => (d as Date).toISOString()));
  });

  it("keeps a column of days with an absent value beside", () => {
    expect(write([[new Date(2026, 2, 17)], [undefined]])).toEqual(["2026-03-17", ""]);
  });

  it("writes the same day in German and in English", () => {
    const rows = [[new Date(2026, 2, 17)]];
    expect(write(rows, german)).toEqual(write(rows));
  });

  it("selectionAsText writes the same day", () => {
    interface Job {
      id: string;
      due: Date;
    }
    let current: Table<Job> | null = null;
    const jobs: Job[] = [
      { id: "a", due: new Date(2026, 2, 17) },
      { id: "b", due: new Date(2026, 2, 18) },
    ];
    function Jobs() {
      const t = useTable(jobs, { rowKey: (j) => j.id });
      current = t;
      const { Table: Frame, Column } = t;
      return (
        <LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>
          <Frame aria-label="Jobs" selectable>
            <Column value="due" label="Due" />
          </Frame>
        </LanguageProvider>
      );
    }
    render(<Jobs />);
    act(() => current!.selection.toggle("a"));
    expect(current!.selectionAsText()).toBe("Due\n2026-03-17");
  });
});
