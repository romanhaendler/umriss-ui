/* Where a grouping is chosen and where it is named (table-grouping 03).

   The column menu offers every groupable column and every group key; pressing
   one adds a level, pressing it again takes the level away, and at three levels
   the others wait. The table toolbar carries ONE tag for the grouping - "Grouped
   by Line › Customer" -, not a tag per level: the order of the levels is what
   a reader must see, and two tags that look alike say nothing about it. */

import { Menu, MenuItem, MenuSeparator, Tag, TagGroup, useWording } from "@umriss-ui/core";
import type { HookSnapshot, Registry } from "./registry";
import { MOST_LEVELS } from "./model/grouping";
import { cx } from "./cx";
import styles from "./Table.module.css";

const labelOf = (registry: Registry, hook: HookSnapshot, id: string): string =>
  registry.groupingEntries(hook.rows).find((e) => e.spec.id === id)?.spec.label ?? id;

/** The grouping section of the column menu. */
export function GroupingChoice({ registry, hook }: { registry: Registry; hook: HookSnapshot }) {
  const wording = useWording();
  const entries = registry.groupingEntries(hook.rows);
  if (entries.length === 0) return null;
  const { grouping, setGrouping } = hook.publicSnapshot;
  return (
    <section className={styles.groupingChoice} aria-label={wording.grouping}>
      <h3 className={styles.groupingHeading}>{wording.grouping}</h3>
      <div className={styles.groupingOptions}>
        {entries.map((entry) => {
          const { id, label } = entry.spec;
          const level = grouping.indexOf(id);
          const active = level !== -1;
          return (
            <button
              key={id}
              type="button"
              className={styles.groupingOption}
              aria-label={wording.groupBy(label)}
              aria-pressed={active}
              disabled={!active && grouping.length >= MOST_LEVELS}
              onClick={() => setGrouping(active ? grouping.filter((g) => g !== id) : [...grouping, id])}
            >
              {active && (
                <span className={styles.groupingLevel} aria-hidden="true">
                  {level + 1}
                </span>
              )}
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** The grouping's tag in the table toolbar while the table is grouped. */
export function GroupingTag({ registry, hook }: { registry: Registry; hook: HookSnapshot }) {
  const wording = useWording();
  const snapshot = hook.publicSnapshot;
  const { grouping } = snapshot;
  if (grouping.length === 0) return null;
  const labels = grouping.map((id) => labelOf(registry, hook, id));
  return (
    /* In a tag group, as the conditions stand: the tag is one stop, its button
       the thing one tabs to, and the ring stands on the tag. */
    <TagGroup aria-label={wording.groupedBy} className={styles.groupingTag}>
      <Tag onRemove={() => snapshot.setGrouping([])} removeLabel={wording.removeGrouping}>
        <Menu
          trigger={
            <button type="button" className={cx(styles.conditionButton, styles.groupingTrigger)}>
              <span className={styles.groupingPrefix}>{wording.groupedBy}</span>
              {labels.map((label, i) => (
                <span key={grouping[i]} className={styles.groupingPath}>
                  {i > 0 && (
                    <span className={styles.groupingSeparator} aria-hidden="true">
                      ›
                    </span>
                  )}
                  {label}
                </span>
              ))}
            </button>
          }
        >
          {grouping.map((id, i) => (
            <MenuItem key={id} onSelect={() => snapshot.setGrouping(grouping.filter((g) => g !== id))}>
              {wording.removeGroupingLevel(labels[i]!)}
            </MenuItem>
          ))}
          <MenuSeparator />
          <MenuItem onSelect={snapshot.unfoldAll}>{wording.unfoldAll}</MenuItem>
          <MenuItem onSelect={snapshot.foldAll}>{wording.foldAll}</MenuItem>
        </Menu>
      </Tag>
    </TagGroup>
  );
}
