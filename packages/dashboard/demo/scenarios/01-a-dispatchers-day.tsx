import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { Alert, Badge, Button, SegmentedControl, Stack, Stat, Text } from "@umriss-ui/core";
import { HeadingType, useDashboard } from "../../src";
import type { DashboardView, HeadingOptions } from "../../src";

/* Data from the logistics world, written out here so the example runs on its own. */

export const title = "Arrange the start screen";

export const lead =
  "A dispatcher at Ferrow Parcel opens the same start screen every day and wants the figure she looks at fifty times a day first. Four cases walk through what the screen does at other widths, while she rearranges it, when something goes wrong and what the application stays in charge of.";

export const callouts = [
  "The case: each one starts the dashboard anew, with the arrangement the application chose for the role.",
  "What the application does - the window it is opened in, a navigation away, a stored value from an old release, a lock - as buttons. What the reader does stands in the sentence beside them: the real controls are in the dashboard.",
  "What happened, in a sentence.",
  "The dashboard itself. It measures its own width, so the stage narrows and widens it without a window.",
  "What the application was told: once per \"Done\" that changed something, with the whole arrangement.",
];

export const builtFrom = [
  "dashboard",
  { name: "Stat", page: "@umriss-ui/core#stat" },
  { name: "SegmentedControl", page: "@umriss-ui/core#segmented-control" },
  { name: "Alert", page: "@umriss-ui/core#alert" },
  { name: "Badge", page: "@umriss-ui/core#badge" },
];

const FIGURES = {
  Orders: { value: 1284, unit: "", decimals: 0 },
  Utilisation: { value: 87.4, unit: "%", decimals: 1 },
  Complaints: { value: 2.9, unit: "%", decimals: 1 },
  Backlog: { value: 38, unit: "", decimals: 0 },
} as const;
type Figure = keyof typeof FIGURES;

const TREND: Record<Figure, readonly number[]> = {
  Orders: [1180, 1210, 1195, 1240, 1262, 1250, 1284],
  Utilisation: [84.1, 85.0, 86.2, 85.7, 86.9, 87.1, 87.4],
  Complaints: [3.4, 3.3, 3.1, 3.2, 3.0, 3.0, 2.9],
  Backlog: [22, 25, 31, 29, 34, 36, 38],
};

const ALERTS = [
  ["Tour 14 is 25 min late", "danger", "Late"],
  ["Dock 3 is out of service", "warning", "Dock"],
  ["Call: Oakridge Pharmacy", "neutral", "Call"],
] as const;

const ORDERS = [
  ["A-2041", "Holloway Garden Supplies", "Packed"],
  ["A-2042", "Marlow & Finch Books", "Picking"],
  ["A-2043", "Brixley Cycles", "Late"],
];

const heading = (id: string, text: string) => ({ id, type: "heading", size: "full" as const, options: { text } satisfies HeadingOptions });

const DISPATCH: DashboardView = {
  widgets: [
    heading("h1", "Now"),
    { id: "f1", type: "figure", size: "small", options: { name: "Orders" } },
    { id: "f2", type: "figure", size: "small", options: { name: "Utilisation" } },
    { id: "f3", type: "figure", size: "small", options: { name: "Complaints" } },
    { id: "f4", type: "figure", size: "small", options: { name: "Backlog" } },
    heading("h2", "Today"),
    { id: "t1", type: "trend", size: "large", options: { name: "Orders" } },
    { id: "a1", type: "alerts", size: "tall", options: {} },
  ],
};

const MANAGEMENT: DashboardView = {
  widgets: [
    heading("h1", "The week"),
    { id: "t1", type: "trend", size: "wide", options: { name: "Utilisation" } },
    { id: "t2", type: "trend", size: "wide", options: { name: "Complaints" } },
    { id: "f1", type: "figure", size: "medium", options: { name: "Orders" } },
  ],
};

const ROLES = { dispatch: DISPATCH, management: MANAGEMENT } as const;
type Role = keyof typeof ROLES;

/** What an older release stored: a widget type that is gone, and a size the trend no longer offers. */
const OLD = {
  widgets: [
    { id: "f1", type: "figure", size: "small", options: { name: "Orders" } },
    { id: "x1", type: "weather", size: "small", options: {} },
    { id: "t1", type: "trend", size: "huge", options: { name: "Orders" } },
    { id: "t2", type: "trend", size: "wide", options: { name: "Backlog" } },
  ],
} as unknown as DashboardView;

const CASES = [
  { value: "monitors", label: "Other monitors" },
  { value: "rearranging", label: "Rearranging" },
  { value: "wrong", label: "When something goes wrong" },
  { value: "governs", label: "What the application governs" },
] as const;
type Case = (typeof CASES)[number]["value"];

const INTRO: Record<Case, string> = {
  monitors:
    "The arrangement of the role has three sections, each with a heading across the width, and four figures in a row at the top. Open it on other screens and see whether every widget stays beside its neighbours.",
  rearranging:
    "Editing is a mode and a draft. A widget's head is the grip, and its menu does everything without a drag. After \"Edit\", try it yourself: drag a head, open a menu, or Tab to a head and press an arrow key. Undo goes back one step.",
  wrong:
    "A drag goes wrong, and a removed widget must not be lost. Undo takes one step back, \"Cancel\" all of them, and the application decides what happens when someone leaves with a draft open.",
  governs:
    "The arrangement is a value the application keeps and hands over. It owes the reader a lenient reading of an old value, a frame that outlives a widget that fails, a way back to its default and the choice to lock editing.",
};

function Trend({ name }: { name: Figure }) {
  const { value, unit, decimals } = FIGURES[name];
  return <Stat label={name} value={value} unit={unit} decimals={decimals} history={TREND[name]} />;
}

function Stage({ shown }: { shown: Case }) {
  const [said, setSaid] = useState("");
  const [width, setWidth] = useState<number | null>(null);
  const [role, setRole] = useState<Role>("dispatch");
  const [locked, setLocked] = useState(false);
  const [broken, setBroken] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [reports, setReports] = useState<string[]>([]);
  const kept = useRef<Partial<Record<Role, DashboardView>>>({});

  const parts = useDashboard({
    defaultView: ROLES[role],
    allowEdit: !locked,
    onDraftChange: setOpen,
    onViewChange: (view) => {
      kept.current[role] = view;
      setReports((all) => [...all, `${role === "dispatch" ? "Dispatch" : "Management"}: ${view.widgets.length} widgets`]);
    },
  });
  const { Dashboard, WidgetType } = parts;
  const edit = () => {
    parts.edit();
    setSaid("The frame, the label \"Editing\" and the changed heads show the mode. The widgets' content rests while it lasts.");
  };

  const buttons: Record<Case, ReactNode> = {
    monitors: [1920, 2560, 820, 390].map((px) => (
      <Button
        key={px}
        onClick={() => {
          setWidth(px);
          setSaid(
            px >= 1920
              ? "The dashboard stands at its maximum width, at the start. The room beside it belongs to the application."
              : px > 400
                ? "The same twelve columns, narrower. Every neighbour stands where it stood."
                : "Below the width a column can be read at, the dashboard is a list, in the same order.",
          );
        }}
      >
        {`Open at ${px} px`}
      </Button>
    )),
    rearranging: [
      <Button key="edit" onClick={edit} disabled={parts.editing}>Edit</Button>,
      <Button key="undo" onClick={() => { parts.undo(); setSaid("One step back, not all of them."); }} disabled={!parts.editing}>Undo</Button>,
      <Button key="catalogue" onClick={() => { parts.catalogue(); setSaid("Every widget type with its name, a sentence and the room it takes. A new widget shows something at once and stands at the end."); }} disabled={!parts.editing}>Add a widget</Button>,
      <Button key="done" onClick={() => { parts.done(); setSaid("Only now, and once, the application is told the whole arrangement."); }} disabled={!parts.editing}>Done</Button>,
    ],
    wrong: [
      <Button key="edit" onClick={edit} disabled={parts.editing}>Edit</Button>,
      <Button key="undo" onClick={() => { parts.undo(); setSaid("One step back; what you did before it stays."); }} disabled={!parts.editing}>Undo</Button>,
      <Button key="cancel" onClick={() => { parts.cancel(); setSaid("Everything stands as before \"Edit\". Nothing was reported."); }} disabled={!parts.editing}>Cancel</Button>,
      <Button
        key="leave"
        onClick={() => {
          if (open) setLeaving(true);
          else setSaid("The application navigates. Nothing was open.");
        }}
      >
        Navigate away
      </Button>,
    ],
    governs: [
      <Button key="old" onClick={() => { parts.cancel(); parts.setView(OLD); setSaid("The stored value named a weather widget that is gone and a trend in a size it no longer offers: the one fell out, the other stands at its starting size, and the room beside it is free. Nothing broke."); }}>Load an old arrangement</Button>,
      <Button key="crash" onClick={() => { setBroken(true); setSaid("A trend threw while drawing. Its frame, head and menu stand; everything else keeps working."); }}>Let a widget fail</Button>,
      <Button key="reset" onClick={() => { parts.edit(); parts.reset(); setSaid("Back to the application's arrangement for this role - one more step of the draft: Undo brings yours back."); }} disabled={locked}>Reset to the default</Button>,
      <Button key="lock" onClick={() => { parts.cancel(); setLocked(!locked); setSaid(locked ? "Editing is allowed." : "Without editing the dashboard is complete as it is: the same arrangement, no button, no mode."); }}>{locked ? "Allow editing" : "Lock editing"}</Button>,
      <Button
        key="role"
        onClick={() => {
          const next: Role = role === "dispatch" ? "management" : "dispatch";
          parts.cancel();
          setRole(next);
          parts.setView(kept.current[next] ?? ROLES[next]);
          setSaid("Another role, another default. Each role keeps its own value.");
        }}
      >
        {role === "dispatch" ? "Sign in as management" : "Sign in as dispatch"}
      </Button>,
    ],
  };

  return (
    <Stack gap={4}>
      <Stack direction="row" gap={2} wrap data-callout="2">
        {buttons[shown]}
      </Stack>
      <Text data-callout="3" tone="secondary" size="sm" aria-live="polite">{said || INTRO[shown]}</Text>
      {leaving && (
        <Alert
          tone="warning"
          title="Unsaved changes"
          actions={
            <Stack direction="row" gap={2}>
              <Button size="sm" onClick={() => { setLeaving(false); setSaid("The draft is untouched."); }}>Keep editing</Button>
              <Button size="sm" onClick={() => { parts.cancel(); setLeaving(false); setSaid("The draft is gone and the application navigates."); }}>Discard and leave</Button>
            </Stack>
          }
        >
          The library tells the application that a draft is open. What it makes of that is its own business; here it asks.
        </Alert>
      )}
      <div data-callout="4" style={{ overflowX: "auto" }}>
        <div style={{ width: width ?? "100%" }}>
          <Dashboard aria-label="Dispatch, today">
            <HeadingType />
            <WidgetType
              name="figure"
              label="Figure"
              sentence="One number."
              sizes={{ small: { columns: 3, rows: 3 }, medium: { columns: 4, rows: 3 } }}
              start="small"
              defaultOptions={{ name: "Orders" as Figure }}
              title={(options) => options.name}
              form={({ options, change }) => (
                <SegmentedControl
                  aria-label="Figure"
                  options={(Object.keys(FIGURES) as Figure[]).map((name) => ({ value: name, label: name }))}
                  value={options.name}
                  onChange={(name) => change({ name })}
                />
              )}
            >
              {({ options, size }) => {
                const { value, unit, decimals } = FIGURES[options.name];
                return <Stat label={options.name} value={value} unit={unit} decimals={decimals} history={size === "medium" ? TREND[options.name] : undefined} />;
              }}
            </WidgetType>
            <WidgetType
              name="trend"
              label="Trend"
              sentence="A figure over the last seven days."
              sizes={{ wide: { columns: 6, rows: 4 }, large: { columns: 8, rows: 4 } }}
              start="wide"
              defaultOptions={{ name: "Orders" as Figure }}
              title={(options) => `${options.name}, last 7 days`}
            >
              {({ options }) => {
                if (broken && options.name === "Orders") throw new Error("The trend could not be drawn");
                return <Trend name={options.name} />;
              }}
            </WidgetType>
            <WidgetType name="alerts" label="Open alerts" sentence="What needs attention now." sizes={{ tall: { columns: 4, rows: 4 } }} start="tall" defaultOptions={{}}>
              {() => (
                <Stack gap={2}>
                  {ALERTS.map(([text, tone, label]) => (
                    <Stack key={text} direction="row" gap={2} align="center">
                      <Badge tone={tone}>{label}</Badge>
                      <Text size="sm">{text}</Text>
                    </Stack>
                  ))}
                </Stack>
              )}
            </WidgetType>
            <WidgetType name="orders" label="Orders" sentence="The work in hand." sizes={{ full: { columns: 12, rows: 4 } }} start="full" defaultOptions={{}}>
              {() => (
                <Stack gap={2}>
                  {ORDERS.map(([id, customer, state]) => (
                    <Text key={id} size="sm">{`${id}  ${customer}  ${state}`}</Text>
                  ))}
                </Stack>
              )}
            </WidgetType>
          </Dashboard>
        </div>
      </div>
      <Text data-callout="5" size="sm" tone="muted">
        {reports.length === 0 ? "Told to the application: nothing yet." : `Told to the application: ${reports.join("; ")}.`}
      </Text>
    </Stack>
  );
}

export default function ArrangeTheStartScreen() {
  const [current, setCurrent] = useState<Case>("monitors");
  return (
    <Stack gap={4}>
      <div data-callout="1">
        <SegmentedControl aria-label="Case" options={CASES.map((one) => ({ value: one.value, label: one.label }))} value={current} onChange={setCurrent} />
      </div>
      <Stage key={current} shown={current} />
    </Stack>
  );
}
