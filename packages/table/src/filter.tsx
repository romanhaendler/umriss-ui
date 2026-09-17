/* Filters: the funnel in the header, the panel of a column filter and the
   conditions in the table toolbar (umriss-table 08, table-filters 03 and 04).

   How a filter asks and checks it says itself (columnFilter.tsx). Here stands
   what the table does the same for every filter: the funnel in the header, the
   panel with its footer, the values it hands the input, and the conditions. The
   application's pre-filter appears nowhere. */

import { useId, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { Button, Popover, Tag, TagGroup, useFormats, useWording } from "@umriss-ui/core";
import { cx } from "./cx";
import type { HookSnapshot, Registry, ColumnEntry } from "./registry";
import { description, filterOf, isBuiltIn, occurringValues } from "./columnFilter";
import styles from "./Table.module.css";

/** The panel of a column's filter, at an anchor - the funnel in the header or
    the condition in the toolbar. */
export function FilterPanel({
  entry,
  registry,
  hook,
  anchor,
  focus,
  open,
  setOpen,
  panelId,
}: {
  entry: ColumnEntry;
  registry: Registry;
  hook: HookSnapshot;
  anchor: RefObject<HTMLElement | null>;
  /** Where the focus goes after "done"; without a statement to the anchor. */
  focus?: RefObject<HTMLElement | null>;
  open: boolean;
  setOpen: (open: boolean) => void;
  panelId: string;
}) {
  const wording = useWording();
  const formats = useFormats();
  const { id, label, format } = entry.spec;
  /* The values of the admitted rows - not of the filtered ones, otherwise a
     choice would vanish the moment one makes it, and not of all of them,
     otherwise the filter would betray what the pre-filter hides (D5). */
  const { values, absent } = useMemo(() => occurringValues(hook.admitted, entry.read, formats), [hook.admitted, entry, formats]);
  const filter = filterOf(entry.spec.filter);
  if (!filter) return null;

  const snapshot = hook.publicSnapshot;
  const Input = filter.Input;
  const env = isBuiltIn(filter)
    ? { absentOccurs: absent, format, kind: registry.kindOf(entry, hook.rows) }
    : {};

  const close = () => {
    setOpen(false);
    (focus ?? anchor).current?.focus();
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      anchorRef={anchor}
      align="end"
      role="dialog"
      ariaLabel={wording.filterColumn(label)}
      id={panelId}
      className={styles.filterPanel}
    >
      <Input
        condition={snapshot.filter[id] ?? null}
        setCondition={(condition) => snapshot.setFilter(id, condition)}
        values={values}
        column={{ id, label }}
        {...env}
      />
      <div className={styles.filterFooter}>
        <Button size="sm" variant="ghost" onClick={() => snapshot.setFilter(id, null)}>
          {wording.filterReset}
        </Button>
        <Button size="sm" onClick={close}>
          {wording.filterDone}
        </Button>
      </div>
    </Popover>
  );
}

/** The funnel in the header of a column with a filter. */
export function ColumnFilterButton({
  entry,
  registry,
  hook,
}: {
  entry: ColumnEntry;
  registry: Registry;
  hook: HookSnapshot;
}) {
  const wording = useWording();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const { id, label } = entry.spec;
  const active = id in hook.publicSnapshot.filter;

  return (
    <>
      <button
        ref={button}
        type="button"
        className={cx(styles.filterButton, active && styles.filterActive)}
        aria-label={wording.filterColumn(label)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen(!open)}
      >
        <svg viewBox="0 0 14 14" width="13" height="13" aria-hidden="true">
          <path
            d="M1.8 2.6h10.4L8.3 7.5v3.4l-2.6 1.1V7.5L1.8 2.6z"
            fill={active ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <FilterPanel
        entry={entry}
        registry={registry}
        hook={hook}
        anchor={button}
        open={open}
        setOpen={setOpen}
        panelId={panelId}
      />
    </>
  );
}

/* The conditions in the table toolbar (table-filters 04): one tag per
   condition, whose content is a button that opens the panel of its filter - at
   the condition, because the funnel may be scrolled away or its column hidden -
   and whose cross lifts it. The tag has only the one button for removing; the
   second one therefore stands inside it. */
export function Conditions({ registry, hook }: { registry: Registry; hook: HookSnapshot }) {
  const wording = useWording();
  const formats = useFormats();
  const list = Object.entries(hook.publicSnapshot.filter).flatMap(([id, condition]) => {
    const entry = registry.columnById(id);
    const filter = entry ? filterOf(entry.spec.filter) : undefined;
    if (!entry || !filter) return [];
    const env = { formats, wording, format: entry.spec.format, kind: registry.kindOf(entry, hook.rows) };
    return [{ entry, text: description(filter, condition, env) }];
  });
  if (list.length === 0) return null;

  return (
    <TagGroup aria-label={wording.conditions} className={styles.conditions}>
      {list.map(({ entry, text }) => (
        <Condition key={entry.spec.id} entry={entry} text={text} registry={registry} hook={hook} />
      ))}
    </TagGroup>
  );
}

function Condition({
  entry,
  text,
  registry,
  hook,
}: {
  entry: ColumnEntry;
  text: string;
  registry: Registry;
  hook: HookSnapshot;
}) {
  const wording = useWording();
  const [open, setOpen] = useState(false);
  const tag = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const { id, label } = entry.spec;
  return (
    <>
      <Tag
        ref={tag}
        className={styles.condition}
        onRemove={() => hook.publicSnapshot.setFilter(id, null)}
        removeLabel={wording.removeConditionNamed(label, text)}
      >
        <button
          ref={button}
          type="button"
          className={styles.conditionButton}
          aria-label={wording.editConditionNamed(label, text)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          onClick={() => setOpen(!open)}
        >
          <span className={styles.filterLabel}>{label}</span>
          <span className={styles.filterValue}>{text}</span>
        </button>
      </Tag>
      <FilterPanel
        entry={entry}
        registry={registry}
        hook={hook}
        anchor={tag}
        focus={button}
        open={open}
        setOpen={setOpen}
        panelId={panelId}
      />
    </>
  );
}
