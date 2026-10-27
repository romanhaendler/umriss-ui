/* <AlarmList> – the alarm list as an interface (shopfloor-instruments 02),
   re-expressed in the interface of @umriss-ui/table (umriss-table 13).

   It is the one existing component with real requirements - lifecycle state,
   flood marking, freshness, selection - and therefore the honest test of
   whether the interface carries a real table. That is why it imports nothing
   from the package but its public entry.

   The list shows all four lifecycle states, and it shows all of them. The one
   an ordinary table loses is the third: came, resolved, and nobody saw it. It
   does not fall out, because the state is ONE field with four values and not a
   pair of booleans that invites `if (active)`.

   A flood is MARKED, never suppressed. All forty rows are there; the marking
   says that they came together. To decide that a human should not see an alarm
   is a safety decision and does not belong in a user-interface library.
   Snoozing is offered, not done: the list shows the action and reports what
   the operator asked for - which alarms, until when - and applies nothing. The
   application then calls `snooze()` on its own data, or refuses. The list
   reports, the application decides (ADR-0023 says the same of the schedule).

   The live region is polite and reports ONE number: the active unacknowledged
   ones. Not every arrival – a list that reads out forty arrivals during a flood
   gets switched off, and then it reports nothing at all any more.

   The table neither sorts nor pages here: the order - the worst first - the
   alarm model has already established, and no column is sortable.

   A hidden alarm - snoozed, suppressed, disabled (alarm-standards 02) -
   stays in the list too. It is drawn neutrally:
   no edge, its priority a word without its colour, its type muted, and its
   state stands there as a word. Colour is for what needs somebody now, and a
   hidden alarm is a decision already taken; that it exists is not. "Not
   absent, only deliberately hidden." */

import { useEffect, useMemo, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
import { Badge, Button, Checkbox, FormField, Input, Menu, MenuItem, Popover, RadioGroup, Tooltip, VisuallyHidden, useFreshness, useDensityFor, useFormats, useWording } from "@umriss-ui/core";
import type { Formats, FreshnessAges, FreshnessReading, Wording } from "@umriss-ui/core";
import { useTable } from "@umriss-ui/table";
import type { TableSelection } from "@umriss-ui/table";
import { RATE_WINDOW_MS, countAcknowledgeable, isActive } from "./alarmModel";
import { PriorityMark, priorityWord } from "./PriorityMark";
import type { AlarmProjection, AlarmRow, LifecycleState } from "./alarmModel";
import styles from "./AlarmList.module.css";

/** The props of `AlarmList`: a div's attributes, the projection to show, and
    the hooks for selection, acknowledgement and freshness. */
export interface AlarmListProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The projection from `alarmModel`. */
  view: AlarmProjection;
  /** The caller's selection helper; without it there is no bulk
      acknowledgement. Deliberately the same one as for any other table: the
      rules on "everything filtered" versus "this page" are already decided
      there. */
  selection?: TableSelection<string>;
  /** Gets the ids that are to be acknowledged. The component does not
      acknowledge itself – it does not own the alarms. */
  onAcknowledge?: (ids: readonly string[]) => void;
  /** Gets the ids the operator wants to snooze and the end they chose
      (`asOf` of the view plus a duration of `snoozeDurations`). The component
      snoozes nothing – the application calls `snooze()` on its own alarms, or
      refuses. The action stands beside "Acknowledge", on the selection, and
      needs `selection`, `snoozeDurations` and this handler. With
      `snoozeReason` there is a third argument: the reason, trimmed, or
      `undefined` when it is optional and left empty. Stored with `snooze()`,
      the reason is shown after the end and the name in the snoozed badge's
      tip and in what is spoken. */
  onSnooze?: (ids: readonly string[], until: number, reason?: string) => void;
  /** Asks for a reason when shelving: "Shelve" then opens a small panel with
      the durations and a field for the reason, and its button reports. With
      `"required"` the button waits for a reason, chosen or typed. Without this
      prop and `snoozeReasons`, "Shelve" is the menu of durations and reports
      at once. The list keeps no draft once the
      panel closes; Escape and a click outside close it without reporting. */
  snoozeReason?: "optional" | "required";
  /** The reasons the application offers when shelving, shown as choices above
      a free-text field for a reason not on the list. Opens the same panel as
      `snoozeReason`; choosing one clears the typed text and typing clears the
      choice, so exactly one reason is reported. */
  snoozeReasons?: readonly string[];
  /** The durations on offer, in milliseconds. Which are permitted is the
      application's rule, so there is no default list; empty or missing, there is no
      snooze action.
      @default no default */
  snoozeDurations?: readonly number[];
  /** Gets the ids whose snooze the operator wants to end early. Shown, beside
      "Acknowledge", only with this handler and a selection. */
  onUnsnooze?: (ids: readonly string[]) => void;
  /** When the data was true. */
  asOf?: Date | number | null;
  /** From when the data counts as stale and from when as disconnected. Without
      them the list shows no freshness – a time without a rule for when it is
      too old is no information. */
  freshness?: FreshnessAges;
  /** "compact" reduces the row height for very dense views.
      @default the density of the `UmrissProvider`, else `"compact"` */
  density?: "regular" | "compact";
  /** Height of the list's scroll area, e.g. `"480px"`: a list of hundreds of
      rows scrolls inside it, under its sticky header, instead of stretching the
      page. */
  maxHeight?: string;
  /** The view of hidden alarms is on. The list does not filter - the
      projection does, with the table's own `filter` and `isHidden`; this
      only says what the switch shows. */
  hiddenOnly?: boolean;
  /** Offers the view as a switch beside its count. Without it the count
      stands as text. */
  onHiddenOnlyChange?: (hiddenOnly: boolean) => void;
}

/** The panel behind "Snooze" when a reason is asked for. Its draft lives here
    and goes with it: the panel is mounted afresh for every opening. */
function SnoozePanel({
  durations,
  reasons,
  required,
  onConfirm,
}: {
  durations: readonly number[];
  reasons: readonly string[];
  required: boolean;
  onConfirm: (ms: number, reason: string) => void;
}) {
  const wording = useWording();
  const [ms, setMs] = useState(String(durations[0]));
  const [reason, setReason] = useState("");
  const [chosen, setChosen] = useState<string | null>(null);
  const group = useRef<HTMLDivElement>(null);
  /* A popover does not take the focus in by itself. */
  useEffect(() => group.current?.querySelector<HTMLInputElement>("input:checked")?.focus(), []);
  const text = chosen ?? reason.trim();
  const blocked = required && text === "";
  return (
    <form
      className={styles.snoozeForm}
      onSubmit={(event) => {
        event.preventDefault();
        if (!blocked) onConfirm(Number(ms), text);
      }}
    >
      <FormField label={wording.alarmSnoozeDuration}>
        <RadioGroup
          ref={group}
          value={ms}
          onChange={setMs}
          options={durations.map((d) => ({ value: String(d), label: durationWord(d, wording) }))}
        />
      </FormField>
      {reasons.length > 0 && (
        <FormField label={wording.alarmSnoozeReason} required={required}>
          <RadioGroup
            value={chosen}
            onChange={(value) => {
              setChosen(value);
              setReason("");
            }}
            options={reasons.map((value) => ({ value, label: value }))}
          />
        </FormField>
      )}
      <FormField label={reasons.length > 0 ? wording.alarmSnoozeOtherReason : wording.alarmSnoozeReason} required={required && reasons.length === 0}>
        <Input
          value={reason}
          onChange={(event) => {
            setReason(event.currentTarget.value);
            setChosen(null);
          }}
        />
      </FormField>
      <Button type="submit" variant="primary" size="sm" disabled={blocked}>
        {wording.alarmSnooze}
      </Button>
    </form>
  );
}

function lifecycleWord(state: LifecycleState, wording: Wording): string {
  switch (state) {
    case "active-unacknowledged":
      return wording.alarmLifecycleActiveUnacknowledged;
    case "active-acknowledged":
      return wording.alarmLifecycleActiveAcknowledged;
    case "resolved-unacknowledged":
      return wording.alarmLifecycleResolvedUnacknowledged;
    default:
      return wording.alarmLifecycleResolvedAcknowledged;
  }
}

/** The availability as the badge's word and as the sentence spoken and shown
    in its tooltip - none while in service, which is the normal case and says
    nothing. A snooze's end is a time of day on the as-of day, a date and a time
    beyond it. */
function availabilityWords(row: AlarmRow, wording: Wording, formats: Formats): { short: string; full: string } | null {
  switch (row.availability) {
    case "snoozed": {
      const snooze = row.alarm.snooze;
      if (!snooze) return null;
      const until = new Date(snooze.until);
      const asOf = new Date(row.alarm.raised + row.age);
      const sameDay = until.toDateString() === asOf.toDateString();
      const end = sameDay ? formats.time(until, false) : formats.dateTime(until, false);
      /* While the alarm is still in alarm, the return time stands in the row,
         not only in the tip: it is the moment the alarm calls again. */
      const short = isActive(row.lifecycle) ? wording.alarmAvailabilitySnoozedUntil(end) : wording.alarmAvailabilitySnoozedShort;
      return { short, full: wording.alarmAvailabilitySnoozed(end, snooze.by, snooze.reason?.trim() || undefined) };
    }
    case "suppressed":
      return { short: wording.alarmAvailabilitySuppressed, full: wording.alarmAvailabilitySuppressed };
    case "disabled":
      return { short: wording.alarmAvailabilityDisabled, full: wording.alarmAvailabilityDisabled };
    default:
      return null;
  }
}

/** The duration as a word; the sentence structure comes from the wording, not
    from this file. */
function durationWord(ms: number, wording: Wording): string {
  const minutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(wording.hoursShort(hours));
  if (hours === 0 || rest > 0) parts.push(wording.minutesShort(rest));
  return parts.join(" ");
}

/** Alarm list: the lifecycle of an alarm, operable.

    The cadence lives in a wrapper of its own: without an as-of time and ages
    the list shows no freshness, and then no timer should run that re-renders
    the whole table every minute. */
type BodyProps = Omit<AlarmListProps, "asOf" | "freshness">;

/** The list of alarms, operable: a table over the rows of `alarmModel`, with
    priority, lifecycle state and age, the acknowledgement of one alarm or of
    the selection, and - with `asOf` and `freshness` - how old the data is. It
    acknowledges nothing itself: it hands the ids to `onAcknowledge`. */
export function AlarmList(props: AlarmListProps) {
  const { asOf, freshness: ages, ...rest } = props;
  if (asOf === undefined || ages === undefined) {
    return <Body {...rest} freshness={null} />;
  }
  return <WithFreshness {...rest} asOf={asOf} ages={ages} />;
}

function WithFreshness({
  asOf,
  ages,
  ...rest
}: BodyProps & { asOf: Date | number | null; ages: FreshnessAges }) {
  const reading = useFreshness(asOf, ages);
  return <Body {...rest} freshness={reading} />;
}

function Body({
  view: projection,
  selection,
  onAcknowledge,
  onSnooze,
  snoozeDurations,
  snoozeReason,
  snoozeReasons,
  onUnsnooze,
  density: ownDensity,
  maxHeight,
  className,
  freshness,
  hiddenOnly = false,
  onHiddenOnlyChange,
  ...rest
}: BodyProps & { freshness: FreshnessReading | null }) {
  const wording = useWording();
  const formats = useFormats();
  const showsAsOf = freshness !== null;
  const disconnected = freshness?.freshness === "lost";

  const { Table, Column } = useTable(projection.visible, { rowKey: (row) => row.id, selection });

  const alarms = useMemo(() => projection.filtered.map((row) => row.alarm), [projection.filtered]);

  /* The number BEFORE the action – and the same set the action then acts on.
     The selection may contain ids the current filter hides; if one counted over
     the filtered set and acknowledged over the whole selection, "acknowledge 2
     alarms" would stand on a button that acknowledges ten. Here the cut is made
     once and both are fed from it.

     Whether a confirmation comes of it the application decides – a confirmation
     the user cannot switch off is itself a danger during a flood. */
  const affected = useMemo(() => {
    if (selection === undefined) return [] as string[];
    return projection.filtered.map((row) => row.id).filter((id) => selection.selected.has(id));
  }, [projection.filtered, selection]);

  const first = projection.filtered[0];
  const viewAsOf = first === undefined ? 0 : first.alarm.raised + first.age;
  const acknowledgeable = useMemo(() => countAcknowledgeable(alarms, affected, viewAsOf), [alarms, affected, viewAsOf]);

  /* The same cut feeds both actions. Only an alarm in service or already
     snoozed can be snoozed (`snooze()` leaves the others alone); only a
     snoozed one can be unsnoozed. The end is counted from the view's own
     as-of time, which every row carries as raised + age. */
  const chosen = useMemo(() => projection.filtered.filter((row) => selection?.selected.has(row.id)), [projection.filtered, selection]);
  const snoozable = chosen.filter((row) => row.availability === "in-service" || row.availability === "snoozed");
  const snoozed = chosen.filter((row) => row.availability === "snoozed");

  /* Compact of its own accord; a provider that sets a density has a say. */
  const density = useDensityFor(ownDensity, "compact");

  const asksReason = snoozeReason !== undefined || (snoozeReasons?.length ?? 0) > 0;
  const hiddenCount = wording.alarmHidden(projection.hiddenAlarms);

  /* The panel's anchor, and a counter so that each opening starts empty. */
  const snoozeButton = useRef<HTMLButtonElement>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [openings, setOpenings] = useState(0);

  return (
    <div className={[styles.list, className].filter(Boolean).join(" ")} {...rest}>
      <div className={styles.bar}>
        <span className={styles.heading}>{wording.alarmList}</span>
        {projection.flood !== null && <Badge tone="warning">{wording.alarmFloodHint(projection.rate, RATE_WINDOW_MS / 60_000)}</Badge>}
        {showsAsOf && freshness !== null && (
          <span className={styles.asOf} data-freshness={freshness.freshness}>
            {freshness.freshness === "lost"
              ? wording.freshnessDisconnected
              : freshness.freshness === "stale"
                ? wording.freshnessStale
                : wording.freshnessFresh}
            {freshness.age !== null && ` · ${formats.relative(freshness.age)}`}
          </span>
        )}
        {/* The switch stays while the view is on, even at zero - or the way
            back would vanish with the last hidden alarm. */}
        {onHiddenOnlyChange !== undefined && (projection.hiddenAlarms > 0 || hiddenOnly) ? (
          <Checkbox
            className={styles.hidden}
            checked={hiddenOnly}
            onChange={(event) => onHiddenOnlyChange(event.currentTarget.checked)}
            label={<span className={styles.hiddenLabel}>{hiddenCount}</span>}
          />
        ) : (
          projection.hiddenAlarms > 0 && (
            <span className={styles.hidden}>{hiddenCount}</span>
          )
        )}
        <span className={styles.filler} />
        {selection !== undefined && onUnsnooze !== undefined && (
          <Button size="sm" disabled={snoozed.length === 0} onClick={() => onUnsnooze(snoozed.map((row) => row.id))}>
            {snoozed.length === 0 ? wording.alarmUnsnooze : wording.alarmUnsnoozeMany(snoozed.length)}
          </Button>
        )}
        {selection !== undefined && onSnooze !== undefined && snoozeDurations !== undefined && snoozeDurations.length > 0 && asksReason && (
          <>
            <Button
              ref={snoozeButton}
              size="sm"
              disabled={snoozable.length === 0}
              aria-haspopup="dialog"
              aria-expanded={panelOpen}
              onClick={() => {
                setOpenings((n) => n + 1);
                setPanelOpen(true);
              }}
            >
              {snoozable.length === 0 ? wording.alarmSnooze : wording.alarmSnoozeMany(snoozable.length)}
            </Button>
            <Popover
              open={panelOpen}
              onOpenChange={setPanelOpen}
              anchorRef={snoozeButton}
              align="end"
              role="dialog"
              aria-label={wording.alarmSnoozeMany(snoozable.length)}
              className={styles.snoozePanel}
            >
              <SnoozePanel
                key={openings}
                durations={snoozeDurations}
                reasons={snoozeReasons ?? []}
                required={snoozeReason === "required"}
                onConfirm={(ms, reason) => {
                  setPanelOpen(false);
                  snoozeButton.current?.focus();
                  onSnooze(snoozable.map((row) => row.id), viewAsOf + ms, reason === "" ? undefined : reason);
                }}
              />
            </Popover>
          </>
        )}
        {selection !== undefined && onSnooze !== undefined && snoozeDurations !== undefined && snoozeDurations.length > 0 && !asksReason && (
          <Menu
            align="end"
            trigger={
              <Button size="sm" disabled={snoozable.length === 0}>
                {snoozable.length === 0 ? wording.alarmSnooze : wording.alarmSnoozeMany(snoozable.length)}
              </Button>
            }
          >
            {snoozeDurations.map((ms) => (
              <MenuItem key={ms} onSelect={() => onSnooze(snoozable.map((row) => row.id), viewAsOf + ms)}>
                {durationWord(ms, wording)}
              </MenuItem>
            ))}
          </Menu>
        )}
        {selection !== undefined && onAcknowledge !== undefined && (
          <Button variant="primary" size="sm" disabled={acknowledgeable === 0} onClick={() => onAcknowledge(affected)}>
            {/* Without a selection it does not say "acknowledge 0 alarms" but
                what the button does. */}
            {acknowledgeable === 0 ? wording.alarmAcknowledge : wording.alarmAcknowledgeMany(acknowledgeable)}
          </Button>
        )}
      </div>

      {/* Polite, and exactly one number. */}
      <div aria-live="polite" aria-atomic="true" className={styles.live}>
        {wording.alarmActiveUnacknowledged(projection.activeUnacknowledged)}
      </div>

      <Table
        aria-label={wording.alarmList}
        selectable={selection !== undefined}
        density={density}
        maxHeight={maxHeight}
        stickyHeader
        rowProps={(row) => ({
          className: styles.row,
          "data-lifecycle": row.lifecycle,
          "data-priority": row.priority,
          "data-availability": row.availability,
        })}
        /* Empty on a live connection means quiet. Empty on a dead one means
           nothing at all – and that is something else. */
        empty={<span className={styles.empty}>{disconnected ? wording.alarmNoneDisconnected : wording.alarmNone}</span>}
      >
        <Column id="type" label={wording.alarmColumnAlarm} value={(row) => row.type.label} rowHeader sortable={false}>
          {(label, row) => (
            <span className={styles.alarm}>
              <span className={styles.label}>{label}</span>
              {/* Words, not colour: the first of a trip, and the first of a flood. */}
              {row.firstOut && <Badge className={styles.counter}>{wording.alarmFirstOut}</Badge>}
              {projection.flood?.first === row.id && <Badge className={styles.counter}>{wording.alarmFirstInFlood}</Badge>}
              {/* A chattering type occupies one row of attention, not forty. */}
              {row.chatters && (
                <Badge tone="warning" pill className={styles.counter}>
                  {wording.alarmChatterHint(row.frequency)}
                </Badge>
              )}
            </span>
          )}
        </Column>
        <Column value="lifecycle" label={wording.alarmColumnLifecycleState} sortable={false}>
          {/* The state stands there as a word. Colour alone carries nothing.
              A hidden alarm names its availability first, as a small neutral
              badge, and keeps its lifecycle beside it: snoozing changes
              neither the condition nor whether anybody acknowledged it. The
              badge says one word, so that the column holds one line; until
              when and by whom stand in its tooltip, and are spoken with it. */}
          {(state, row) => {
            const availability = availabilityWords(row, wording, formats);
            const badge =
              availability === null ? null : availability.short === availability.full ? (
                <Badge className={styles.availability}>{availability.short}</Badge>
              ) : (
                <Tooltip content={availability.full}>
                  <Badge className={styles.availability}>
                    <span aria-hidden="true">{availability.short}</span>
                    <VisuallyHidden>{availability.full}</VisuallyHidden>
                  </Badge>
                </Tooltip>
              );
            return (
              <span className={styles.state}>
                {badge}
                <span className={styles.lifecycle}>{lifecycleWord(state, wording)}</span>
              </span>
            );
          }}
        </Column>
        <Column value="priority" label={wording.alarmColumnPriority} sortable={false}>
          {(p, row) => (
            <span className={styles.priority}>
              <PriorityMark priority={p} lifecycle={row.lifecycle} availability={row.availability} />
              <span aria-hidden="true">{priorityWord(p, wording)}</span>
            </span>
          )}
        </Column>
        <Column
          id="raised"
          label={wording.alarmColumnRaised}
          value={(row) => new Date(row.alarm.raised)}
          format="dateTimeWithSeconds"
          numeric
          sortable={false}
        />
        <Column value="duration" label={wording.alarmColumnDuration} sortable={false}>
          {(ms) => <span className={styles.state}>{durationWord(ms, wording)}</span>}
        </Column>
        <Column value="frequency" label={wording.alarmColumnFrequency} format="count" sortable={false} />
      </Table>
    </div>
  );
}
