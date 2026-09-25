/* Characterisation of the formats - both sets, character for character.

   This file was written before the formats moved into the language seam and
   held down the German notation the library shipped then. With ADR-0024 the
   default became English and German moved behind
   `@umriss-ui/core/wording/de`, so the file was rewritten once - deliberately,
   and this is the only place where that notation change is visible as a diff
   rather than as a surprise in some component's test.

   What it holds down now is both halves of the decision: what a caller gets
   without a provider, and what a German application gets with the import. The
   expected values are derived from the notation rules - day before month in
   both, slashes against dots, the group and decimal separators the other way
   round, a 24-hour clock in both - and not from the way the implementation
   computes them.

   The import paths of the English half deliberately point at the old
   scattered places (`DatePicker/format`, `NumberInput/number`, `Meter`). Those
   modules pass through to the seam; whoever imports here checks both sides of
   the same promise.

   Time zone: Europe/Berlin (vitest.config.ts). The 2026 changeover dates are
   29.03. (forward) and 25.10. (back). */

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Meter } from "../src/components/DataViz";
import {
  displayFormat,
  dateTimeFormat,
  shortFormat,
  longFormat,
  monthFormat,
  timeFormat,
} from "../src/components/DatePicker/format";
import { offsetLabel } from "../src/components/DatePicker/time";
import { formatNumber } from "../src/components/NumberInput/number";
import { GERMAN_FORMATS } from "../src/lib/language/de";

/* A date with a two-digit day and a one-digit month, so that the zero padding
   becomes visible, and a time with a one-digit hour for the same reason. */
const SAMPLE = new Date(2026, 2, 17, 9, 5, 3);

describe("The default notation: dates", () => {
  it("writes the display date two-digit with slashes, the day first", () => {
    expect(displayFormat.format(SAMPLE)).toBe("17/03/2026");
  });

  it("writes the short form without the year, both parts two-digit", () => {
    expect(shortFormat.format(SAMPLE)).toBe("17/03");
  });

  it("writes the month out in full with the year", () => {
    expect(monthFormat.format(SAMPLE)).toBe("March 2026");
  });

  it("writes the long form with the weekday and a one-digit day", () => {
    expect(longFormat.format(SAMPLE)).toBe("Tuesday, 17 March 2026");
  });

  it("pads a one-digit day in the short form", () => {
    expect(shortFormat.format(new Date(2026, 0, 5))).toBe("05/01");
  });
});

describe("The default notation: times", () => {
  /* The clock is the product's decision and not the locale's: 24 hours, here
     as in the German set. A screen that writes 3 pm where 15:00 was
     meant is read wrongly once and distrusted afterwards. */
  it("writes hour and minute two-digit on a 24-hour clock", () => {
    expect(timeFormat(false).format(SAMPLE)).toBe("09:05");
    expect(timeFormat(false).format(new Date(2026, 2, 17, 15, 0, 0))).toBe("15:00");
  });

  it("appends the second two-digit", () => {
    expect(timeFormat(true).format(SAMPLE)).toBe("09:05:03");
  });

  it("writes midnight as 00:00", () => {
    expect(timeFormat(false).format(new Date(2026, 2, 17, 0, 0, 0))).toBe("00:00");
  });
});

describe("The default notation: date and time together", () => {
  it("joins the two with a comma", () => {
    expect(dateTimeFormat(false).format(SAMPLE)).toBe("17/03/2026, 09:05");
  });

  it("joins the two with seconds", () => {
    expect(dateTimeFormat(true).format(SAMPLE)).toBe("17/03/2026, 09:05:03");
  });
});

describe("The offset label", () => {
  /* Unchanged by the notation: the zone name reads the same in both. */
  it("names winter time GMT+1", () => {
    expect(offsetLabel(new Date(2026, 0, 15, 12, 0, 0))).toBe("GMT+1");
  });

  it("names summer time GMT+2", () => {
    expect(offsetLabel(new Date(2026, 6, 15, 12, 0, 0))).toBe("GMT+2");
  });

  /* The doubled hour at the end of summer time: 25.10.2026, 02:30 exists
     twice. The earlier instant still stands at GMT+2, the later one at GMT+1 -
     the same wall time, two labels. This is the one place at which "equal on
     output" is checked and not assumed. */
  it("distinguishes the two instances of the doubled hour", () => {
    const early = new Date(Date.UTC(2026, 9, 25, 0, 30));
    const late = new Date(Date.UTC(2026, 9, 25, 1, 30));
    expect(offsetLabel(early)).toBe("GMT+2");
    expect(offsetLabel(late)).toBe("GMT+1");
  });
});

describe("The default notation: numbers", () => {
  it("separates thousands with a comma", () => {
    expect(formatNumber(1234)).toBe("1,234");
  });

  it("separates decimals with a dot", () => {
    expect(formatNumber(1234.5)).toBe("1,234.5");
  });

  it("forces the requested number of places", () => {
    expect(formatNumber(1234.5, 2)).toBe("1,234.50");
  });

  it("cuts off only at ten decimal places without a place count", () => {
    expect(formatNumber(1.23456789)).toBe("1.23456789");
  });

  it("writes zero decimal places as a whole number", () => {
    expect(formatNumber(1234.56, 0)).toBe("1,235");
  });

  it("puts the minus in front", () => {
    expect(formatNumber(-1234.5, 1)).toBe("-1,234.5");
  });

  it("separates millions twice", () => {
    expect(formatNumber(1234567.89, 2)).toBe("1,234,567.89");
  });
});

/* The percentage format lies as a private module constant in Meter and can
   therefore only be held down through its visible output - which is exactly
   what this block does. */
describe("The default notation: per cent", () => {
  it("rounds to whole per cent", () => {
    render(<Meter value={0.735} />);
    expect(screen.getByRole("meter").textContent).toBe("74%");
  });

  it("writes full utilisation as 100 per cent", () => {
    render(<Meter value={1} />);
    expect(screen.getByRole("meter").textContent).toBe("100%");
  });
});

/* The German set, as a German application takes it: one import beside the
   German wording (ADR-0024). These are the values the library shipped as its
   default until then, and they are held down here so that the language did not
   merely move but survived. */
describe("The German notation", () => {
  it("writes dates with dots, the day first", () => {
    expect(GERMAN_FORMATS.date(SAMPLE)).toBe("17.03.2026");
    expect(GERMAN_FORMATS.dateShort(SAMPLE)).toBe("17.03.");
  });

  it("writes the month and the weekday in German", () => {
    expect(GERMAN_FORMATS.month(SAMPLE)).toBe("März 2026");
    expect(GERMAN_FORMATS.dateLong(SAMPLE)).toBe("Dienstag, 17. März 2026");
  });

  it("writes the same 24-hour clock", () => {
    expect(GERMAN_FORMATS.time(SAMPLE, false)).toBe("09:05");
    expect(GERMAN_FORMATS.time(SAMPLE, true)).toBe("09:05:03");
  });

  it("joins date and time with a comma", () => {
    expect(GERMAN_FORMATS.dateTime(SAMPLE, false)).toBe("17.03.2026, 09:05");
  });

  it("separates thousands with a dot and decimals with a comma", () => {
    expect(GERMAN_FORMATS.number(1234.5, 2)).toBe("1.234,50");
    expect(GERMAN_FORMATS.number(1234567.89, 2)).toBe("1.234.567,89");
    expect(GERMAN_FORMATS.count(1204)).toBe("1.204");
  });

  /* The separator between number and sign is a NO-BREAK space (U+00A0),
     written here as an escape: as a literal character it is
     indistinguishable from a plain space in the source. */
  it("writes per cent with a no-break space", () => {
    expect(GERMAN_FORMATS.percent(0.735)).toBe("74 %");
  });

  it("files Ä with A, which is what German collation is for", () => {
    expect(GERMAN_FORMATS.compareText("Änderung", "Beginn")).toBeLessThan(0);
    expect(GERMAN_FORMATS.compareText("Änderung", "Abgang")).toBeGreaterThan(0);
  });

  it("names an elapsed duration in German", () => {
    expect(GERMAN_FORMATS.relative(3 * 60_000)).toBe("vor 3 Minuten");
  });
});
