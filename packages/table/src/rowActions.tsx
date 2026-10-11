/* The row's last cell: its actions as buttons or a menu, the Delete that asks
   inside the row, and the buttons of an open Row draft. */

import { useContext, useEffect, useRef, useState } from "react";
import { Button, IconButton, Menu, MenuItem, Popover } from "@umriss-ui/core";
import type { Wording } from "@umriss-ui/core";
import { cx } from "./cx";
import type { Registry } from "./registry";
import { GridContext } from "./grid";
import styles from "./Table.module.css";

/* Up to two actions stand as buttons in the row; from three on ALL of them
   stand in a menu (umriss-table 09). A mixture - one button and one menu -
   would give the column a different width depending on the number, and an
   action would wander between row and menu when a third one is added. */
export const AT_MOST_IN_THE_ROW = 2;

export function RowActionsCell({
  actions,
  row,
  name,
  wording,
  line,
}: {
  actions: ReturnType<Registry["actions"]["ordered"]>;
  row: unknown;
  name: string;
  wording: Wording;
  /** The row's line in grid mode - to know whether a Row draft elsewhere holds the grid. */
  line: string;
}) {
  const grid = useContext(GridContext);
  /* A Row draft elsewhere holds the grid: a click here is refused as a
     focus is, and triggers nothing (ADR-0036). */
  const held = grid?.editing?.row === true && grid.editing.line !== line;
  const remove = grid?.remove;
  const [asking, setAsking] = useState(false);
  const askedRef = useRef(false);
  const deleteRef = useRef<HTMLButtonElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);
  /* The question takes the focus to its safe answer, and Keep brings it
     back to Delete: the button pressed is gone from under it either way. */
  useEffect(() => {
    if (asking) keepRef.current?.focus();
    else if (askedRef.current) deleteRef.current?.focus();
    askedRef.current = asking;
  }, [asking]);

  /* A bulk action always gets a list - at the row one made from it. That way
     "delete three" is one confirmation and not three. */
  const trigger = (spec: (typeof actions)[number]["spec"]) => {
    if (held) return;
    const onSelect = spec.onSelect as (target: unknown) => void;
    onSelect(spec.bulk ? [row] : row);
  };

  /* Delete asks inside its row before it is reported: a row lost to one
     stray click is data lost. */
  const deletion = remove && (asking ? (
    <>
      <span className={styles.deleteAsk}>{wording.deleteRowAsk}</span>
      <Button className={styles.toned} size="sm" variant="danger" aria-label={wording.rowAction(wording.deleteRow, name)} onClick={() => { setAsking(false); remove(row); }}>
        {wording.deleteRow}
      </Button>
      <Button ref={keepRef} size="sm" variant="ghost" aria-label={wording.rowAction(wording.keepRow, name)} onClick={() => setAsking(false)}>
        {wording.keepRow}
      </Button>
    </>
  ) : (
    <Button ref={deleteRef} size="sm" variant="ghost" aria-label={wording.rowAction(wording.deleteRow, name)} onClick={() => !held && setAsking(true)}>
      {wording.deleteRow}
    </Button>
  ));

  if (actions.length <= AT_MOST_IN_THE_ROW) {
    return (
      <div className={cx(styles.actions, asking && styles.decision)}>
        {!asking && actions.map(({ key, spec }) => (
          <Button
            key={key}
            size="sm"
            variant="ghost"
            aria-label={wording.rowAction(spec.label, name)}
            onClick={() => trigger(spec)}
          >
            {spec.label}
          </Button>
        ))}
        {deletion}
      </div>
    );
  }
  return (
    <div className={cx(styles.actions, asking && styles.decision)}>
      {!asking && (
        <Menu
          align="end"
          trigger={
            <IconButton size="sm" variant="ghost" aria-label={wording.rowActionsMenu(name)}>
              ⋯
            </IconButton>
          }
        >
          {actions.map(({ key, spec }) => (
            <MenuItem key={key} tone={spec.tone} onSelect={() => trigger(spec)}>
              {spec.label}
            </MenuItem>
          ))}
        </Menu>
      )}
      {deletion}
    </div>
  );
}

/** A Row draft's buttons, where the row's actions stood (ADR-0036): Save and
    Discard, and - once someone tried to leave the draft - the word that it
    must be saved or discarded first. */
export function RowDraftButtons({ name, wording }: { name: string; wording: Wording }) {
  const grid = useContext(GridContext)!;
  const anchor = useRef<HTMLDivElement>(null);
  return (
    <div ref={anchor} className={cx(styles.actions, styles.decision, styles.draftButtons)}>
      <Button className={styles.toned} size="sm" variant="primary" aria-label={wording.rowAction(wording.saveRow, name)} onClick={grid.save}>
        {wording.saveRow}
      </Button>
      <Button size="sm" variant="ghost" aria-label={wording.rowAction(wording.discardRow, name)} onClick={grid.discard}>
        {wording.discardRow}
      </Button>
      <Popover
        open={grid.editing?.refused === true}
        onOpenChange={() => undefined}
        anchorRef={anchor}
        restoreFocus={false}
        offset={4}
        className={styles.draftMessage}
      >
        <span role="status">{wording.saveOrDiscardFirst}</span>
      </Popover>
    </div>
  );
}
