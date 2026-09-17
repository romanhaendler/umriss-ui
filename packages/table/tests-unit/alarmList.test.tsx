/* The alarm list as an interface (shopfloor-instruments 02). Pulled from
   @umriss-ui/core to @umriss-ui/table (umriss-table 13): what changed were the
   import paths and the names of the props on <AlarmList> (library-audit 09) -
   nothing else.

   The case that stands first is the reason for the whole component: the
   fleeting alarm – came, cleared, nobody saw it – must be visible. An ordinary
   table loses it. */

import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { AlarmList } from "../src";
import { alarmModel, alarmColumns } from "../src/alarms/alarmModel";
import type { Alarm, AlarmType } from "../src/alarms/alarmModel";
import { useTableSelection } from "../src";
import { UmrissProvider, DEFAULT_WORDING, LanguageProvider, useWording } from "@umriss-ui/core";

const NOW = new Date("2026-03-17T10:30:00Z").getTime();
const MIN = 60_000;

const TYPES: AlarmType[] = [
  { id: "temp", label: "Furnace temperature too high", priority: "high" },
  { id: "pressure", label: "Pressure below target", priority: "medium" },
  { id: "filter", label: "Filter fouled", priority: "low" },
];

/** Three of the four lifecycle states, one per row. */
const ALARMS: Alarm[] = [
  { id: "m1", type: "temp", lifecycle: "standing-unacknowledged", raised: NOW - 4 * MIN },
  {
    id: "m2",
    type: "pressure",
    lifecycle: "standing-acknowledged",
    raised: NOW - 40 * MIN,
    acknowledgedAt: NOW - 30 * MIN,
  },
  {
    id: "m3",
    type: "filter",
    lifecycle: "cleared-unacknowledged",
    raised: NOW - 90 * MIN,
    cleared: NOW - 88 * MIN,
  },
];

function projectionOf(alarms: readonly Alarm[] = ALARMS) {
  return alarmModel({ alarms, types: TYPES, asOf: NOW });
}

function WithSelection({ onAcknowledge }: { onAcknowledge: (ids: readonly string[]) => void }) {
  const [alarms] = useState<readonly Alarm[]>(ALARMS);
  const projection = alarmModel({ alarms, types: TYPES, asOf: NOW });
  const selection = useTableSelection(projection.filtered.map((row) => row.id));
  return <AlarmList view={projection} selection={selection} onAcknowledge={onAcknowledge} />;
}

describe("The fleeting alarm stays visible", () => {
  it("shows the alarm that came and cleared again, unacknowledged", () => {
    render(<AlarmList view={projectionOf()} />);
    expect(screen.getByText("Filter fouled")).toBeTruthy();
    expect(screen.getByText(DEFAULT_WORDING.lifecycleClearedUnacknowledged)).toBeTruthy();
  });

  it("leaves the alarm that is done out – the model's only removal", () => {
    const done: Alarm[] = [
      ...ALARMS,
      {
        id: "m4",
        type: "pressure",
        lifecycle: "cleared-acknowledged",
        raised: NOW - 200 * MIN,
        cleared: NOW - 190 * MIN,
        acknowledgedAt: NOW - 189 * MIN,
      },
    ];
    render(<AlarmList view={projectionOf(done)} />);
    expect(screen.queryByText(DEFAULT_WORDING.lifecycleClearedAcknowledged)).toBeNull();
  });

  it("shows all three remaining states at once", () => {
    render(<AlarmList view={projectionOf()} />);
    expect(screen.getByText(DEFAULT_WORDING.lifecycleStandingUnacknowledged)).toBeTruthy();
    expect(screen.getByText(DEFAULT_WORDING.lifecycleStandingAcknowledged)).toBeTruthy();
    expect(screen.getByText(DEFAULT_WORDING.lifecycleClearedUnacknowledged)).toBeTruthy();
  });
});

describe("Priority stands there as a word, not only as a colour", () => {
  it("names each of the three levels in the text", () => {
    render(<AlarmList view={projectionOf()} />);
    expect(screen.getByText(DEFAULT_WORDING.priorityHigh)).toBeTruthy();
    expect(screen.getByText(DEFAULT_WORDING.priorityMedium)).toBeTruthy();
    expect(screen.getByText(DEFAULT_WORDING.priorityLow)).toBeTruthy();
  });
});

describe("The live region", () => {
  it("is polite and reports the number of standing unacknowledged ones", () => {
    const { container } = render(<AlarmList view={projectionOf()} />);
    const region = container.querySelector("[aria-live]");
    expect(region?.getAttribute("aria-live")).toBe("polite");
    expect(region?.textContent).toBe(DEFAULT_WORDING.standingUnacknowledged(1));
  });

  it("counts only standing AND unacknowledged – not everything unacknowledged", () => {
    // The fleeting alarm is unacknowledged and still not standing. If it
    // counted, the region would call somebody to a fault that is over.
    const { container } = render(<AlarmList view={projectionOf()} />);
    expect(container.querySelector("[aria-live]")?.textContent).toBe(
      DEFAULT_WORDING.standingUnacknowledged(1),
    );
  });

  it("follows the number when the set changes", () => {
    const two: Alarm[] = [
      ...ALARMS,
      { id: "m5", type: "pressure", lifecycle: "standing-unacknowledged", raised: NOW - MIN },
    ];
    const { container, rerender } = render(<AlarmList view={projectionOf()} />);
    expect(container.querySelector("[aria-live]")?.textContent).toBe(
      DEFAULT_WORDING.standingUnacknowledged(1),
    );
    rerender(<AlarmList view={projectionOf(two)} />);
    expect(container.querySelector("[aria-live]")?.textContent).toBe(
      DEFAULT_WORDING.standingUnacknowledged(2),
    );
  });
});

describe("Acknowledging", () => {
  it("reports exactly once per click – counted, not compared", () => {
    // Acknowledging the same selection twice yields the same set. A test that
    // compares sets cannot tell "once" from "twice".
    const onAcknowledge = vi.fn();
    render(<WithSelection onAcknowledge={onAcknowledge} />);
    const boxes = screen.getAllByRole("checkbox");
    fireEvent.click(boxes[1] as HTMLElement);
    const button = screen.getByRole("button", { name: /acknowledge/i });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(onAcknowledge).toHaveBeenCalledTimes(2);
  });

  it("passes the ids of the selection through", () => {
    const onAcknowledge = vi.fn();
    render(<WithSelection onAcknowledge={onAcknowledge} />);
    const boxes = screen.getAllByRole("checkbox");
    fireEvent.click(boxes[1] as HTMLElement);
    fireEvent.click(boxes[2] as HTMLElement);
    fireEvent.click(screen.getByRole("button", { name: /acknowledge/i }));
    const ids = onAcknowledge.mock.calls[0]?.[0] as readonly string[];
    expect(ids).toHaveLength(2);
  });

  it("names the number before anything happens", () => {
    render(<WithSelection onAcknowledge={vi.fn()} />);
    const boxes = screen.getAllByRole("checkbox");
    fireEvent.click(boxes[1] as HTMLElement);
    expect(
      screen.getByRole("button", { name: DEFAULT_WORDING.acknowledgeAlarms(1) }),
    ).toBeTruthy();
  });

  it("acknowledges exactly what the button announces – even under a filter", () => {
    /* The selection may contain ids the filter hides. If the component counted
       over the filtered set and acknowledged over the whole selection,
       "acknowledge 1 alarm" would asOf on a button that acknowledges three –
       in a control room the worst kind of error: one that quietly does more
       than it announces. */
    const onAcknowledge = vi.fn();

    function WithFilter() {
      const [highOnly, setHighOnly] = useState(false);
      const projection = alarmModel(
        { alarms: ALARMS, types: TYPES, asOf: NOW },
        { filter: highOnly ? (row) => row.priority === "high" : undefined },
      );
      // The selection knows all three, independently of the filter.
      const selection = useTableSelection(ALARMS.map((m) => m.id));
      return (
        <>
          <button onClick={() => setHighOnly(true)}>filtern</button>
          <button onClick={() => ALARMS.forEach((m) => selection.toggle(m.id))}>alle</button>
          <AlarmList view={projection} selection={selection} onAcknowledge={onAcknowledge} />
        </>
      );
    }

    render(<WithFilter />);
    fireEvent.click(screen.getByRole("button", { name: "alle" }));
    // Three selected, two acknowledgeable: the third has long been acknowledged.
    expect(
      screen.getByRole("button", { name: DEFAULT_WORDING.acknowledgeAlarms(2) }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "filtern" }));
    const button = screen.getByRole("button", { name: DEFAULT_WORDING.acknowledgeAlarms(1) });
    fireEvent.click(button);

    // One was announced – so exactly one is acknowledged.
    expect(onAcknowledge).toHaveBeenCalledTimes(1);
    expect(onAcknowledge.mock.calls[0]?.[0]).toHaveLength(1);
  });

  it("disables the button without a selection", () => {
    render(<WithSelection onAcknowledge={vi.fn()} />);
    const button = screen.getByRole("button", { name: /acknowledge/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});

describe("Empty is not the same as empty", () => {
  it("reports quiet when nothing is standing", () => {
    render(<AlarmList view={projectionOf([])} />);
    expect(screen.getByText(DEFAULT_WORDING.noAlarms)).toBeTruthy();
  });

  it("says on a dead line that the emptiness means nothing", () => {
    // An empty list on a standing connection means "the plant is quiet". On a
    // disconnected one it means nothing at all – and that is something else.
    render(
      <AlarmList
        view={projectionOf([])}
        asOf={null}
        freshness={{ stale: 5 * MIN, lost: 30 * MIN }}
      />,
    );
    expect(screen.getByText(DEFAULT_WORDING.noAlarmsDisconnected)).toBeTruthy();
    expect(screen.queryByText(DEFAULT_WORDING.noAlarms)).toBeNull();
  });
});

describe("A flood is marked, not suppressed", () => {
  it("shows every row and the marking with it", () => {
    const flood: Alarm[] = Array.from({ length: 12 }, (_, i) => ({
      id: `f${i}`,
      type: "temp",
      lifecycle: "standing-unacknowledged" as const,
      raised: NOW - i * 1000,
    }));
    render(
      <AlarmList
        view={alarmModel({
          alarms: flood,
          types: TYPES,
          asOf: NOW,
          flood: { windowMs: 10 * MIN, atLeast: 10 },
        })}
      />,
    );
    // Twelve rows, not fewer: nothing is hidden.
    expect(screen.getAllByText("Furnace temperature too high")).toHaveLength(12);
    expect(screen.getAllByText(DEFAULT_WORDING.floodHint(12)).length).toBeGreaterThan(0);
  });
});

/* library-audit 03: an override of the wording reaches the column names - in
   the list's header row and in the projection a caller builds a column menu and
   a CSV header row from. */
describe("Column names from the wording", () => {
  function Sample() {
    const wording = useWording();
    const projection = alarmModel({
      alarms: ALARMS,
      types: TYPES,
      asOf: NOW,
      columns: alarmColumns(wording),
    });
    return (
      <>
        <AlarmList view={projection} />
        <output data-testid="columns">{projection.columns.map((s) => s.label).join("|")}</output>
      </>
    );
  }

  it("reaches the header row and the projection", () => {
    render(
      <LanguageProvider wording={{ columnAlarm: "Alarm", columnAge: "Age" }}>
        <Sample />
      </LanguageProvider>,
    );
    expect(screen.getByRole("columnheader", { name: "Alarm" })).toBeTruthy();
    const columns = screen.getByTestId("columns").textContent!.split("|");
    expect(columns).toContain("Alarm");
    expect(columns).toContain("Age");
  });
});

/* The density (library-audit 07), pulled here from `anbieter.test.tsx` in
   @umriss-ui/core when the alarm list left there (umriss-table 14). It is the
   case where it gets delicate: compact of its own accord – a provider that says
   nothing about the density must not pull it to "regular". */
describe("Density of the alarm list", () => {
  const tableClass = () => document.querySelector("table")?.className ?? "";

  it("stays at its own default without a statement, even under a provider", () => {
    render(
      <UmrissProvider>
        <AlarmList view={projectionOf()} />
      </UmrissProvider>,
    );
    expect(tableClass()).toMatch(/compact/);
  });

  it("becomes regular under comfortable", () => {
    render(
      <UmrissProvider density="comfortable">
        <AlarmList view={projectionOf()} />
      </UmrissProvider>,
    );
    expect(tableClass()).not.toMatch(/compact/);
  });

  it("lets a density on the list beat the setting", () => {
    render(
      <UmrissProvider density="comfortable">
        <AlarmList view={projectionOf()} density="compact" />
      </UmrissProvider>,
    );
    expect(tableClass()).toMatch(/compact/);
  });
});
