/* A table under formats that name a time zone: the cell, the day group and the
   day filter follow the zone, and the head of a time column names it where the
   reader's own is another. The run's zone is Europe/Berlin (vitest.config.ts). */

import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { LanguageProvider } from "@umriss-ui/core";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { useTable } from "../src";
import type { Table } from "../src";

interface Alarm {
  id: string;
  at: Date;
}

// 04:30 on 17 March in Berlin, 23:30 on 16 March in New York.
const ALARMS: Alarm[] = [
  { id: "a", at: new Date("2026-03-17T03:30:00Z") },
  { id: "b", at: new Date("2026-03-17T12:00:00Z") },
];

let current: Table<Alarm> | null = null;
const capture = (t: Table<Alarm>) => {
  current = t;
};

function Alarms({ grouped = false }: { grouped?: boolean }) {
  const t = useTable(ALARMS, { rowKey: (a) => a.id, defaultGrouping: grouped ? ["at"] : [] });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame aria-label="Alarms">
      <Column value="id" label="Alarm" rowHeader />
      <Column value="at" label="Raised" format="dateTime" group="day" filter="range" />
    </Frame>
  );
}

const inZone = (timeZone: string | undefined, children: ReactNode) => (
  <LanguageProvider formats={timeZone ? { timeZone } : {}}>{children}</LanguageProvider>
);

describe("a table under a named time zone", () => {
  afterEach(() => vi.restoreAllMocks());

  it("groups by the zone's days", () => {
    render(inZone("America/New_York", <Alarms grouped />));
    expect(screen.getByText("16/03/2026")).toBeTruthy();
    expect(screen.getByText("17/03/2026")).toBeTruthy();
  });

  it("filters by the zone's days and writes the cell in the zone", () => {
    render(inZone("America/New_York", <Alarms />));
    expect(screen.getByText("16/03/2026, 23:30")).toBeTruthy();
    // 16 March in New York holds the first alarm only.
    const day = new Date("2026-03-16T12:00:00-04:00");
    act(() => current!.setFilter("at", { from: day, to: day }));
    expect(current!.filtered.map((a) => a.id)).toEqual(["a"]);
  });

  it("the unnamed table cuts at the reader's midnight", () => {
    render(inZone(undefined, <Alarms grouped />));
    expect(screen.queryByText("16/03/2026")).toBeNull();
    expect(screen.getByText("17/03/2026")).toBeTruthy();
  });

  const head = () => screen.getByRole("columnheader", { name: /Raised/ }).textContent;

  /* The reader's zone comes from a formatter in the default locale; the named
     zone is canonicalised through one in "en". */
  const readerIn = (timeZone: string) => {
    const original = Intl.DateTimeFormat.prototype.resolvedOptions;
    vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockImplementation(function (this: Intl.DateTimeFormat) {
      const options = original.call(this);
      return options.locale === "en" ? options : { ...options, timeZone };
    });
  };

  it("names the zone in the head of a time column when the reader's is another", () => {
    readerIn("America/Chicago");
    render(inZone("America/New_York", <Alarms />));
    expect(head()).toBe("Raised New York Time");
    expect(screen.getByRole("columnheader", { name: "Raised New York Time" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Alarm" }).textContent).toBe("Alarm");
  });

  it("names none under Europe/Berlin, the reader's zone, or without a zone", () => {
    const { unmount } = render(inZone("Europe/Berlin", <Alarms />));
    expect(head()).toBe("Raised");
    unmount();
    render(inZone(undefined, <Alarms />));
    expect(head()).toBe("Raised");
  });
});

describe("a server with a named zone", () => {
  it("writes the instant of a Date column", () => {
    const html = renderToString(inZone("America/New_York", <Alarms />));
    expect(html).toContain("16/03/2026, 23:30");
  });

  it("hydrates without a recoverable error", async () => {
    const container = document.createElement("div");
    container.innerHTML = renderToString(inZone("America/New_York", <Alarms />));
    document.body.append(container);
    const onRecoverableError = vi.fn();
    await act(async () => {
      hydrateRoot(container, inZone("America/New_York", <Alarms />), { onRecoverableError });
    });
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.textContent).toContain("16/03/2026, 23:30");
    container.remove();
  });
});
