/* Characterisation of the formats, written before the move into the seam.

   This file holds down what the library outputs today - character for
   character, derived from the German notation rule and not from the way the
   implementation computes it. It was written against the scattered
   implementations and stays unchanged afterwards: only then does a green run
   prove that the move shifted nothing.

   The import paths deliberately still point at the old places. Their modules
   pass through to the seam after the move; whoever imports here checks both
   sides of the same promise.

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

/* A date with a two-digit day and a one-digit month, so that the zero padding
   becomes visible, and a time with a one-digit hour for the same reason. */
const SAMPLE = new Date(2026, 2, 17, 9, 5, 3);

describe("Date formats", () => {
  it("writes the display date two-digit with dots", () => {
    expect(displayFormat.format(SAMPLE)).toBe("17.03.2026");
  });

  it("writes the short form without the year, both parts two-digit", () => {
    expect(shortFormat.format(SAMPLE)).toBe("17.03.");
  });

  it("writes the month out in full with the year", () => {
    expect(monthFormat.format(SAMPLE)).toBe("März 2026");
  });

  it("writes the long form with the weekday and a one-digit day", () => {
    expect(longFormat.format(SAMPLE)).toBe("Dienstag, 17. März 2026");
  });

  it("pads a one-digit day in the short form", () => {
    expect(shortFormat.format(new Date(2026, 0, 5))).toBe("05.01.");
  });
});

describe("Time formats", () => {
  it("writes hour and minute two-digit", () => {
    expect(timeFormat(false).format(SAMPLE)).toBe("09:05");
  });

  it("appends the second two-digit", () => {
    expect(timeFormat(true).format(SAMPLE)).toBe("09:05:03");
  });

  it("writes midnight as 00:00", () => {
    expect(timeFormat(false).format(new Date(2026, 2, 17, 0, 0, 0))).toBe("00:00");
  });
});

describe("Date and time together", () => {
  it("joins the two with a comma", () => {
    expect(dateTimeFormat(false).format(SAMPLE)).toBe("17.03.2026, 09:05");
  });

  it("joins the two with seconds", () => {
    expect(dateTimeFormat(true).format(SAMPLE)).toBe("17.03.2026, 09:05:03");
  });
});

describe("Offset label", () => {
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

describe("Number notation", () => {
  it("separates thousands with a dot", () => {
    expect(formatNumber(1234)).toBe("1.234");
  });

  it("separates decimals with a comma", () => {
    expect(formatNumber(1234.5)).toBe("1.234,5");
  });

  it("forces the requested number of places", () => {
    expect(formatNumber(1234.5, 2)).toBe("1.234,50");
  });

  it("cuts off only at ten decimal places without a place count", () => {
    expect(formatNumber(1.23456789)).toBe("1,23456789");
  });

  it("writes zero decimal places as a whole number", () => {
    expect(formatNumber(1234.56, 0)).toBe("1.235");
  });

  it("puts the minus in front", () => {
    expect(formatNumber(-1234.5, 1)).toBe("-1.234,5");
  });

  it("separates millions twice", () => {
    expect(formatNumber(1234567.89, 2)).toBe("1.234.567,89");
  });
});

/* The percentage format lies as a private module constant in Meter and can
   therefore only be held down through its visible output - which is exactly
   what this block does. Count and text collation were bound by the table's
   tests; those have stood in @umriss-ui/table since umriss-table 14
   (`filterleisteWortlaut.test.tsx`: "43 von 1.204", `tabellenModell.test.ts`:
   "sorts text by German collation") and are not duplicated here. */
describe("Percentage format", () => {
  /* The separator between number and sign is a NO-BREAK space (U+00A0), written
     here as an escape: it is a shipped value, and as a literal character it is
     indistinguishable from a plain space in the source. */
  it("rounds to whole per cent and separates with a no-break space", () => {
    render(<Meter value={0.735} />);
    expect(screen.getByRole("meter").textContent).toBe("74 %");
  });

  it("writes full utilisation as 100 per cent", () => {
    render(<Meter value={1} />);
    expect(screen.getByRole("meter").textContent).toBe("100 %");
  });
});
