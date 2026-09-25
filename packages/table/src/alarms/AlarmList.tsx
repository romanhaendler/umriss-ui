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

import { useMemo } from "react";
import type { HTMLAttributes } from "react";
import { Badge, Button, Checkbox, Tooltip, VisuallyHidden, useFreshness, useDensityFor, useFormats, useWording } from "@umriss-ui/core";
import type { Formats, FreshnessAges, FreshnessReading, Wording } from "@umriss-ui/core";
import { useTable } from "../index";
import type { TableSelection } from "../index";
import { countAcknowledgeable, isHidden } from "./alarmModel";
import type { AlarmProjection, AlarmRow, LifecycleState, Priority } from "./alarmModel";
import styles from "./AlarmList.module.css";

/* The props carry the names from library-audit 09. With ADR-0018 the
   identifiers behind them are English too, so there is no longer a seam at the
   destructuring pattern. */
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
  /** When the data was true. */
  asOf?: Date | number | null;
  /** From when the data counts as stale and from when as disconnected. Without
      them the list shows no freshness – a time without a rule for when it is
      too old is no information. */
  freshness?: FreshnessAges;
  /** "compact" reduces the row height for very dense views. Without a
      statement the density of the `UmrissProvider`, without a setting
      "compact". */
  density?: "regular" | "compact";
  /** The view of hidden alarms is on. The list does not filter - the
      projection does, with the table's own `filter` and `isHidden`; this
      only says what the switch shows. */
  hiddenOnly?: boolean;
  /** Offers the view as a switch beside its count. Without it the count
      stands as text. */
  onHiddenOnlyChange?: (hiddenOnly: boolean) => void;
}

function lifecycleWord(state: LifecycleState, wording: Wording): string {
  switch (state) {
    case "active-unacknowledged":
      return wording.lifecycleActiveUnacknowledged;
    case "active-acknowledged":
      return wording.lifecycleActiveAcknowledged;
    case "resolved-unacknowledged":
      return wording.lifecycleResolvedUnacknowledged;
    default:
      return wording.lifecycleResolvedAcknowledged;
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
      return { short: wording.availabilitySnoozedShort, full: wording.availabilitySnoozed(end, snooze.by) };
    }
    case "suppressed":
      return { short: wording.availabilitySuppressed, full: wording.availabilitySuppressed };
    case "disabled":
      return { short: wording.availabilityDisabled, full: wording.availabilityDisabled };
    default:
      return null;
  }
}

function priorityWord(p: Priority, wording: Wording): string {
  return p === "high" ? wording.priorityHigh : p === "medium" ? wording.priorityMedium : wording.priorityLow;
}

function priorityTone(p: Priority): "danger" | "warning" | "neutral" {
  return p === "high" ? "danger" : p === "medium" ? "warning" : "neutral";
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
  density: ownDensity,
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

  const acknowledgeable = useMemo(() => countAcknowledgeable(alarms, affected), [alarms, affected]);

  /* Compact of its own accord; a provider that sets a density has a say
     (library-audit 07). */
  const density = useDensityFor(ownDensity, "compact");

  const hiddenCount = wording.hiddenAlarms(projection.hiddenAlarms);

  return (
    <div className={[styles.list, className].filter(Boolean).join(" ")} {...rest}>
      <div className={styles.bar}>
        <span className={styles.heading}>{wording.alarms}</span>
        {projection.flood !== null && <Badge tone="warning">{wording.floodHint(projection.flood.count)}</Badge>}
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
        {selection !== undefined && onAcknowledge !== undefined && (
          <Button variant="primary" size="sm" disabled={acknowledgeable === 0} onClick={() => onAcknowledge(affected)}>
            {/* Without a selection it does not say "acknowledge 0 alarms" but
                what the button does. */}
            {acknowledgeable === 0 ? wording.acknowledgeAlarm : wording.acknowledgeAlarms(acknowledgeable)}
          </Button>
        )}
      </div>

      {/* Polite, and exactly one number. */}
      <div aria-live="polite" aria-atomic="true" className={styles.live}>
        {wording.activeUnacknowledged(projection.activeUnacknowledged)}
      </div>

      <Table
        ariaLabel={wording.alarms}
        selectable={selection !== undefined}
        density={density}
        stickyHeader
        rowProps={(row) => ({
          className: styles.row,
          "data-lifecycle": row.lifecycle,
          "data-priority": row.priority,
          "data-availability": row.availability,
        })}
        /* Empty on a live connection means quiet. Empty on a dead one means
           nothing at all – and that is something else. */
        empty={<span className={styles.empty}>{disconnected ? wording.noAlarmsDisconnected : wording.noAlarms}</span>}
      >
        <Column id="type" label={wording.columnAlarm} value={(row) => row.type.label} rowHeader sortable={false}>
          {(label, row) => (
            <>
              <span className={styles.label}>{label}</span>
              {/* A chattering type occupies one row of attention, not forty. */}
              {row.chatters && (
                <Badge tone="warning" pill className={styles.counter}>
                  {wording.chatterHint(row.frequency)}
                </Badge>
              )}
            </>
          )}
        </Column>
        <Column value="lifecycle" label={wording.columnLifecycleState} sortable={false}>
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
        <Column value="priority" label={wording.columnPriority} sortable={false}>
          {(p, row) => (
            <Badge tone={isHidden(row.availability) ? "neutral" : priorityTone(p)}>
              {priorityWord(p, wording)}
            </Badge>
          )}
        </Column>
        <Column
          id="raised"
          label={wording.columnRaised}
          value={(row) => new Date(row.alarm.raised)}
          numeric
          sortable={false}
        />
        <Column value="duration" label={wording.columnDuration} sortable={false}>
          {(ms) => durationWord(ms, wording)}
        </Column>
        <Column value="frequency" label={wording.columnFrequency} format="count" sortable={false} />
      </Table>
    </div>
  );
}
