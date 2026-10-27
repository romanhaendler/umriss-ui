import { useEffect, useRef, useState } from "react";
import type { ComponentPropsWithRef } from "react";
import { Badge, Button, VisuallyHidden, useFormats, useFreshness, useWording } from "@umriss-ui/core";
import type { FreshnessAges, FreshnessReading } from "@umriss-ui/core";
import { PRIORITIES, RATE_WINDOW_MS, isHidden } from "./alarmModel";
import type { AlarmProjection, AlarmRow, Priority } from "./alarmModel";
import { PriorityMark, priorityWord } from "./PriorityMark";
import styles from "./AlarmBanner.module.css";

/** What `onAnnunciate` reports: an alarm that was not waiting before now is (with the highest priority among those), or the last waiting alarm is gone. */
export type AlarmAnnunciation = { kind: "new"; priority: Priority } | { kind: "cleared" };

/** Props of `AlarmBanner`; the rest go to its root `<section>`. */
export interface AlarmBannerProps extends Omit<ComponentPropsWithRef<"section">, "children"> {
  /** The projection of an `alarmModel` call WITHOUT a filter. A filter in the list must never hide the worst alarm from the banner. */
  view: AlarmProjection;
  /** Reports the shown alarm's id, as `[id]`. The button stands only with this handler; the banner applies nothing. */
  onAcknowledge?: (ids: readonly string[]) => void;
  /** Called by "Open list", which stands only with this handler. */
  onOpen?: () => void;
  /**
   * The cue for sound: `{ kind: "new", priority }` when alarms that are active, unacknowledged and in service were not so in the previous projection (a shelve that ran out counts), `{ kind: "cleared" }` when the last such alarm is gone. Derived by comparing the ids of one projection with the last; there is no timer and the first render fires nothing. The horn, its repetition and a silence button are the application's.
   * Placing the banner sticky is the host's layout: `position: sticky; top: 0`.
   */
  onAnnunciate?: (event: AlarmAnnunciation) => void;
  /** When the data was true. */
  asOf?: Date | number | null;
  /** From when the data counts as stale and from when as disconnected. Without them the banner shows no freshness. Every alarm stays shown and counted either way. */
  freshness?: FreshnessAges;
}

const waiting = (row: AlarmRow) => row.lifecycle === "active-unacknowledged" && !isHidden(row.availability);

/**
 * The worst active, unacknowledged alarm in service on every screen, the count per priority, and one tap to the list or to acknowledge. It interrupts a screen reader only for a new alarm of higher priority than the one shown, never for a count.
 */
export function AlarmBanner({ asOf, freshness: ages, ...rest }: AlarmBannerProps) {
  if (asOf === undefined || ages === undefined) return <Body {...rest} reading={null} />;
  return <WithFreshness {...rest} asOf={asOf} ages={ages} />;
}

function WithFreshness({ asOf, ages, ...rest }: Omit<AlarmBannerProps, "asOf" | "freshness"> & { asOf: Date | number | null; ages: FreshnessAges }) {
  return <Body {...rest} reading={useFreshness(asOf, ages)} />;
}

function Body({
  view,
  onAcknowledge,
  onOpen,
  onAnnunciate,
  reading,
  className,
  ref,
  ...rest
}: Omit<AlarmBannerProps, "asOf" | "freshness"> & { reading: FreshnessReading | null }) {
  const wording = useWording();
  const formats = useFormats();
  const rows = view.filtered.filter(waiting);
  /* The most urgent by rank, whatever order the host sorted the view in; on a tie the view's order decides. */
  const worst = rows.reduce<AlarmRow | undefined>((a, b) => (a === undefined || b.rank < a.rank ? b : a), undefined);
  const lost = reading?.freshness === "lost";

  /* The ids and the best rank of the previous projection; null until the first one has been seen, so that the first render says and fires nothing. */
  const before = useRef<{ ids: Set<string>; rank: number } | null>(null);
  const [alert, setAlert] = useState("");

  useEffect(() => {
    const ids = new Set(rows.map((row) => row.id));
    const rank = worst?.rank ?? Infinity;
    const previous = before.current;
    before.current = { ids, rank };
    if (previous === null) return;
    const added = rows.filter((row) => !previous.ids.has(row.id));
    const best = added.reduce<AlarmRow | undefined>((a, b) => (a === undefined || b.rank < a.rank ? b : a), undefined);
    if (best !== undefined) {
      onAnnunciate?.({ kind: "new", priority: best.priority });
      if (best.rank < previous.rank) setAlert(wording.alarmBannerAlert(priorityWord(best.priority, wording).toLowerCase(), best.type.label));
    } else if (previous.ids.size > 0 && ids.size === 0) {
      onAnnunciate?.({ kind: "cleared" });
    }
    // Only a new projection is compared; the rows follow from it, and a new handler alone must not fire the cue.
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section {...rest} ref={ref} aria-label={wording.alarmBanner} className={className ? `${styles.banner} ${className}` : styles.banner}>
      {worst === undefined ? (
        <span className={styles.none} data-lost={lost ? "" : undefined}>
          {lost ? wording.alarmBannerDisconnected : wording.alarmBannerNone}
        </span>
      ) : (
        <>
          <span className={styles.worst}>
            <PriorityMark priority={worst.priority} lifecycle={worst.lifecycle} availability={worst.availability} />
            <span>{worst.type.label}</span>
            <span className={styles.time}>{formats.time(new Date(worst.alarm.raised), true)}</span>
          </span>
          {rows.length > 1 && <span className={styles.more}>{wording.alarmBannerMore(rows.length - 1)}</span>}
          <span className={styles.counts}>
            {PRIORITIES.filter((p) => view.unacknowledgedByPriority[p] > 0).map((p) => (
              <span key={p} role="group" className={styles.count} aria-label={`${wording.alarmPriorityName(PRIORITIES.indexOf(p) + 1, priorityWord(p, wording))}: ${view.unacknowledgedByPriority[p]}`}>
                <PriorityMark priority={p} lifecycle="active-unacknowledged" aria-hidden="true" role="presentation" />
                <span aria-hidden="true">{view.unacknowledgedByPriority[p]}</span>
              </span>
            ))}
          </span>
        </>
      )}
      {view.flood !== null && <Badge tone="warning">{wording.alarmFloodHint(view.rate, RATE_WINDOW_MS / 60_000)}</Badge>}
      {reading !== null && (
        <span className={styles.asOf} data-freshness={reading.freshness}>
          {reading.freshness === "lost" ? wording.freshnessDisconnected : reading.freshness === "stale" ? wording.freshnessStale : wording.freshnessFresh}
          {reading.age !== null && ` · ${formats.relative(reading.age)}`}
        </span>
      )}
      {worst !== undefined && onAcknowledge !== undefined && (
        <Button size="sm" onClick={() => onAcknowledge([worst.id])}>
          {wording.alarmAcknowledge}
        </Button>
      )}
      {onOpen !== undefined && (
        <Button size="sm" variant="ghost" onClick={onOpen}>
          {wording.alarmBannerOpen}
        </Button>
      )}
      <VisuallyHidden role="alert">{alert}</VisuallyHidden>
    </section>
  );
}
