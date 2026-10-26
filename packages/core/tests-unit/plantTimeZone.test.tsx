/* A time zone named in the formats: both sets write the instant in it, a
   replaced entry stays its own, an unknown zone throws, and the label of the
   zone appears only where the reader's is another.

   Time zone of the run: Europe/Berlin (vitest.config.ts). */

import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { DEFAULT_FORMATS, LanguageProvider, mergeLanguage, useFormats, useTimeZoneLabel } from "../src";
import { GERMAN_FORMATS } from "../src/lib/language/de";

const AT = new Date("2026-03-17T03:30:00Z");
const written = (formats: typeof DEFAULT_FORMATS) => [
  formats.date(AT),
  formats.dateShort(AT),
  formats.month(AT),
  formats.dateLong(AT),
  formats.time(AT, false),
  formats.time(AT, true),
  formats.dateTime(AT, false),
  formats.dateTime(AT, true),
  formats.offset(AT),
  formats.timeZoneName(AT),
];
const named = (timeZone: string, base = DEFAULT_FORMATS) => mergeLanguage({ formats: { ...base, timeZone } }).formats;

describe("formats naming a time zone", () => {
  it("writes the English set in America/New_York", () => {
    expect(written(named("America/New_York"))).toEqual([
      "16/03/2026",
      "16/03",
      "March 2026",
      "Monday, 16 March 2026",
      "23:30",
      "23:30:00",
      "16/03/2026, 23:30",
      "16/03/2026, 23:30:00",
      "GMT-4",
      "New York Time",
    ]);
  });

  it("writes the English set in Asia/Kolkata", () => {
    expect(written(named("Asia/Kolkata"))).toEqual([
      "17/03/2026",
      "17/03",
      "March 2026",
      "Tuesday, 17 March 2026",
      "09:00",
      "09:00:00",
      "17/03/2026, 09:00",
      "17/03/2026, 09:00:00",
      "GMT+5:30",
      "India Time",
    ]);
  });

  it("writes the German set in America/New_York in German notation", () => {
    const de = named("America/New_York", GERMAN_FORMATS);
    expect(de.locale).toBe("de-DE");
    expect(de.date(AT)).toBe("16.03.2026");
    expect(de.dateTime(AT, false)).toBe("16.03.2026, 23:30");
    expect(de.timeZoneName(AT)).toBe("New York (Ortszeit)");
  });

  it("naming Europe/Berlin, the zone of the run, gives the unnamed set's texts", () => {
    expect(written(named("Europe/Berlin"))).toEqual(written(DEFAULT_FORMATS));
    expect(written(named("Europe/Berlin", GERMAN_FORMATS))).toEqual(written(GERMAN_FORMATS));
  });

  it("keeps the identity of the shipped sets and names its zone and locale", () => {
    expect(mergeLanguage({ formats: {} }).formats.date).toBe(DEFAULT_FORMATS.date);
    expect(DEFAULT_FORMATS.timeZone).toBeUndefined();
    expect(DEFAULT_FORMATS.locale).toBe("en-GB");
    expect(named("Asia/Kolkata").timeZone).toBe("Asia/Kolkata");
  });

  it("leaves a replaced date entry its own", () => {
    const date = () => "mine";
    const formats = mergeLanguage({ formats: { date, timeZone: "America/New_York" } }).formats;
    expect(formats.date(AT)).toBe("mine");
    expect(formats.dateTime(AT, false)).toBe("16/03/2026, 23:30");
  });

  it("throws Intl's RangeError for an unknown zone, naming it", () => {
    expect(() => mergeLanguage({ formats: { timeZone: "Mars/Base" } })).toThrow(RangeError);
    expect(() => mergeLanguage({ formats: { timeZone: "Mars/Base" } })).toThrow(/Mars\/Base/);
  });
});

function Label() {
  return <span data-testid="label">{useTimeZoneLabel() ?? "none"}</span>;
}

function Stamp() {
  return <span data-testid="stamp">{useFormats().dateTime(AT, false)}</span>;
}

describe("useTimeZoneLabel", () => {
  afterEach(() => vi.restoreAllMocks());

  /* The reader's zone comes from a formatter in the default locale; the named
     zone is canonicalised through one in "en". */
  const readerIn = (timeZone: string) => {
    const original = Intl.DateTimeFormat.prototype.resolvedOptions;
    vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockImplementation(function (this: Intl.DateTimeFormat) {
      const options = original.call(this);
      return options.locale === "en" ? options : { ...options, timeZone };
    });
  };

  it("names the zone where the reader's is another", () => {
    readerIn("America/Chicago");
    render(<LanguageProvider formats={{ timeZone: "Europe/Berlin" }}><Label /></LanguageProvider>);
    expect(screen.getByTestId("label").textContent).toBe("CET");
  });

  it("is null where the reader's zone is the named one", () => {
    render(<LanguageProvider formats={{ timeZone: "Europe/Berlin" }}><Label /></LanguageProvider>);
    expect(screen.getByTestId("label").textContent).toBe("none");
  });

  it("is null without a named zone", () => {
    readerIn("America/Chicago");
    render(<Label />);
    expect(screen.getByTestId("label").textContent).toBe("none");
  });
});

describe("a server with a named zone", () => {
  const page = (zone: boolean) => (
    <LanguageProvider formats={zone ? { timeZone: "America/New_York" } : {}}>
      <Stamp />
      <Label />
    </LanguageProvider>
  );

  it("writes the instant, hydrates without an error, and the label waits", async () => {
    const html = renderToString(page(true));
    expect(html).toContain("16/03/2026, 23:30");
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.append(container);
    const onRecoverableError = vi.fn();
    await act(async () => {
      hydrateRoot(container, page(true), { onRecoverableError });
    });
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.textContent).toContain("16/03/2026, 23:30");
    expect(container.textContent).toContain("New York Time");
    container.remove();
  });

  it("without a zone the server still writes no instant", () => {
    expect(renderToString(page(false))).not.toMatch(/\d\d\/\d\d\/\d{4}/);
  });
});
