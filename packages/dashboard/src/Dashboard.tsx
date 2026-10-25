import { Children, isValidElement, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { announce, Button, Card, Drawer, GripGlyph, Heading, Menu, MenuItem, MenuSeparator, ModalBody, ModalHeader, Popover, Skeleton, Text, useWording } from "@umriss-ui/core";
import { add, move, newId, remove, resize, setOptions } from "./edit";
import type { Editor } from "./useDashboard";
import styles from "./Dashboard.module.css";
import { Failed } from "./Failed";
import { readView } from "./model";
import type { DashboardView, DashboardWidget, WidgetSize } from "./model";
import { pack } from "./pack";
import type { Place } from "./pack";
import { shareOf } from "./share";
import { useDrag } from "./useDrag";
import { headingTypeOf, HeadingType, titleOf, WidgetType } from "./WidgetType";
import type { HeadingOptions, WidgetContent, WidgetTypeProps } from "./WidgetType";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/** The grid never has more or fewer columns. */
const COLUMNS = 12;

/** The props of `Dashboard`. */
export interface DashboardProps extends HTMLAttributes<HTMLDivElement> {
  /** The `WidgetType`s of this dashboard. */
  children?: ReactNode;
  /** The `name`s of the widget types the catalogue lists.
      @default every declared type */
  catalogue?: ReadonlyArray<string>;
}

/* The content is called inside its own component, so that a throw lands in its boundary. */
function Content({ render, ...content }: { render: AnyType["children"] } & WidgetContent<unknown>) {
  return render(content);
}

type AnyType = WidgetTypeProps<unknown>;

/* The custom properties that put a card, a heading or a placeholder at its place. */
const placeStyle = (place: Place, order: number) =>
  ({ "--_dashboard-column": place.column + 1, "--_dashboard-row": place.row + 1, "--_dashboard-columns": place.columns, "--_dashboard-rows": place.rows, "--_dashboard-order": order }) as CSSProperties;

const area = (span: { columns: number; rows: number }) => span.columns * span.rows;

/* A card's body, the scroll box of its content. While the content is taller or wider than the body
   (measured in the browser: nothing is known on the server), the body is a tab stop named by the
   card's title, so the keyboard reaches what the wheel reaches. The mode's `inert` takes the tab stop
   away and leaves the scroll position as it is. */
function Body({ title, editing, children }: { title: string; editing: boolean; children: ReactNode }) {
  const body = useRef<HTMLDivElement>(null);
  const [scrolls, setScrolls] = useState(false);
  useEffect(() => {
    const el = body.current;
    if (!el) return;
    const measure = () => setScrolls(el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth);
    const resize = new ResizeObserver(measure);
    /* The observer watches the body and the roots of its content; a replaced root is observed anew. */
    const watch = () => {
      resize.disconnect();
      resize.observe(el);
      for (const child of el.children) resize.observe(child);
      measure();
    };
    const mutation = new MutationObserver(watch);
    mutation.observe(el, { childList: true });
    watch();
    return () => {
      resize.disconnect();
      mutation.disconnect();
    };
  }, []);
  const tabStop = scrolls && !editing;
  return (
    <div ref={body} className={styles.body} inert={editing} {...(tabStop ? { role: "group", tabIndex: 0, "aria-label": title } : {})}>
      {children}
    </div>
  );
}

/* Keeps the element of an id in a map for as long as it stands. */
const track = (map: Map<string, HTMLElement>, id: string) => (el: HTMLElement | null) => {
  if (el) map.set(id, el);
  else map.delete(id);
};

/** The Dashboard of `useDashboard`, drawing a view. */
export function DashboardOf({ view: given, editor, className, children, catalogue, ...rest }: DashboardProps & { view: DashboardView; editor: Editor }) {
  const wording = useWording();
  const builtin = useMemo(() => headingTypeOf(wording), [wording]);
  const types = new Map<string, AnyType>();
  for (const child of Children.toArray(children)) {
    if (isValidElement<AnyType>(child) && child.type === WidgetType) types.set(child.props.name, child.props);
    else if (isValidElement(child) && child.type === HeadingType) types.set(builtin.name, builtin as AnyType);
  }
  const { register } = editor;
  useEffect(() => register(types));
  const view = readView(given, types);
  const shown = view.widgets.flatMap((widget) => {
    const type = types.get(widget.type);
    const span = type?.sizes[widget.size];
    return type && span ? [{ widget, type, span }] : [];
  });

  const grid = useRef<HTMLDivElement>(null);
  const [cards] = useState(() => new Map<string, HTMLElement>());
  const [heads] = useState(() => new Map<string, HTMLElement>());
  const [triggers] = useState(() => new Map<string, HTMLElement>());
  const addButton = useRef<HTMLButtonElement>(null);

  const { editing } = editor;
  const total = view.widgets.length;
  const moveTo = (id: string, title: string, to: number) => {
    const from = view.widgets.findIndex((widget) => widget.id === id);
    const target = Math.max(0, Math.min(total - 1, to));
    if (from === target) return;
    editor.step(move(id, target));
    announce(wording.dashboardMoved(title, from + 1, target + 1, total));
  };

  const { drag, placeholder, handlers } = useDrag({
    grid,
    cards,
    shown: shown.map(({ widget, type, span }) => ({ id: widget.id, span, title: titleOf(type, widget.options) })),
    drop: (id, onto) => {
      const one = shown.find((s) => s.widget.id === id)!;
      moveTo(id, titleOf(one.type, one.widget.options), view.widgets.findIndex((widget) => widget.id === onto));
    },
    cancelled: (title) => announce(wording.dashboardDragCancelled(title)),
  });

  const held = drag ? shown.findIndex((one) => one.widget.id === drag.id) : -1;
  const sequence = shown.map((_, i) => i);
  if (held >= 0) sequence.splice(drag!.target, 0, ...sequence.splice(held, 1));
  const packed = pack(sequence.map((i) => shown[i]!.span), COLUMNS);
  const places = shown.map((_, i) => packed[sequence.indexOf(i)]!);

  const [optionsFor, setOptionsFor] = useState<string | null>(null);
  const anchor = useRef<HTMLElement | null>(null);
  const added = useRef<string | null>(null);
  useEffect(() => {
    if (!added.current) return;
    cards.get(added.current)?.scrollIntoView?.({ block: "nearest" });
    added.current = null;
  });
  /* After a removal the focus goes on to a head that stands (null: the bar's button). */
  const focusAfter = useRef<string | null | false>(false);
  useEffect(() => {
    if (focusAfter.current === false) return;
    (focusAfter.current === null ? addButton.current : heads.get(focusAfter.current))?.focus();
    focusAfter.current = false;
  });

  const listed = [...types.values()].filter((type) => !catalogue || catalogue.includes(type.name));
  const addType = (type: AnyType) => {
    const widget = { id: newId(view, type.name), type: type.name, size: type.start, options: type.defaultOptions };
    added.current = widget.id;
    editor.step(add(widget));
    announce(wording.dashboardAdded(titleOf(type, widget.options), total + 1, total + 1));
  };
  const optionsType = optionsFor ? types.get(view.widgets.find((widget) => widget.id === optionsFor)?.type ?? "") : undefined;
  const optionsWidget = view.widgets.find((widget) => widget.id === optionsFor);

  /* The head of a widget in the editing mode: a tab stop, the grip of a drag, the arrow keys' target. */
  const headOf = (widget: DashboardWidget, title: string, i: number, at: number): HTMLAttributes<HTMLDivElement> & { ref?: (el: HTMLDivElement | null) => void } =>
    editing
      ? {
          ref: track(heads, widget.id),
          className: cx(styles.head, styles.editingHead),
          ...handlers(widget.id, i),
          role: "group",
          tabIndex: 0,
          "aria-label": wording.dashboardHead(title, at + 1, total),
          onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
            if (event.target !== event.currentTarget) return;
            const to = { ArrowLeft: at - 1, ArrowUp: at - 1, ArrowRight: at + 1, ArrowDown: at + 1, Home: 0, End: total - 1 }[event.key];
            if (to === undefined) return;
            event.preventDefault();
            moveTo(widget.id, title, to);
          },
        }
      : { className: styles.head };

  /* The menu of a widget's head: the moves, the sizes, the options, remove. */
  const menuOf = (widget: DashboardWidget, type: AnyType, title: string, i: number, at: number) => {
    const sizes = Object.entries(type.sizes).sort(([, a], [, b]) => area(a) - area(b));
    return (
      <Menu
        align="end"
        trigger={
          <Button ref={track(triggers, widget.id)} size="sm" variant="ghost" aria-label={wording.dashboardMenu(title)}>
            <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <path d="M1.5 5h.01M5 5h.01M8.5 5h.01" />
            </svg>
          </Button>
        }
      >
        <MenuItem disabled>{wording.dashboardPlace(at + 1, total)}</MenuItem>
        <MenuItem disabled={at === 0} onSelect={() => moveTo(widget.id, title, 0)}>{wording.dashboardMoveStart}</MenuItem>
        <MenuItem disabled={at === 0} onSelect={() => moveTo(widget.id, title, at - 1)}>{wording.dashboardMoveEarlier}</MenuItem>
        <MenuItem disabled={at === total - 1} onSelect={() => moveTo(widget.id, title, at + 1)}>{wording.dashboardMoveLater}</MenuItem>
        <MenuItem disabled={at === total - 1} onSelect={() => moveTo(widget.id, title, total - 1)}>{wording.dashboardMoveEnd}</MenuItem>
        {sizes.length > 1 && (
          <>
            <MenuSeparator />
            {sizes.map(([name, span]) => (
              <MenuItem
                key={name}
                aria-current={name === widget.size || undefined}
                onSelect={() => {
                  editor.step(resize(widget.id, name as WidgetSize));
                  announce(wording.dashboardResized(title, wording.dashboardSizes[name as WidgetSize]));
                }}
              >
                {wording.dashboardSizeEntry(wording.dashboardSizes[name as WidgetSize], shareOf(span), name === widget.size)}
              </MenuItem>
            ))}
          </>
        )}
        {type.form && (
          <>
            <MenuSeparator />
            <MenuItem
              onSelect={() => {
                anchor.current = triggers.get(widget.id) ?? null;
                setOptionsFor(widget.id);
              }}
            >
              {wording.dashboardOptions}
            </MenuItem>
          </>
        )}
        <MenuSeparator />
        <MenuItem
          tone="danger"
          onSelect={() => {
            focusAfter.current = (shown[i + 1] ?? shown[i - 1])?.widget.id ?? null;
            editor.step(remove(widget.id));
            announce(wording.dashboardRemoved(title));
          }}
        >
          {wording.dashboardRemove}
        </MenuItem>
      </Menu>
    );
  };

  return (
    <div role="group" className={cx(styles.root, className)} data-editing={editing || undefined} {...rest}>
      {editor.allowed && (
        <div className={styles.bar}>
          {editing ? (
            <>
              <span className={styles.mode}>{wording.dashboardEditing}</span>
              <Button size="sm" disabled={!editor.canUndo} onClick={editor.undo}>{wording.dashboardUndo}</Button>
              <Button size="sm" disabled={!editor.canRedo} onClick={editor.redo}>{wording.dashboardRedo}</Button>
              <Button size="sm" disabled={!editor.canReset} onClick={editor.reset}>{wording.dashboardReset}</Button>
              <Button ref={addButton} size="sm" onClick={() => editor.setCatalogue(true)}>{wording.dashboardAddWidget}</Button>
              <Button size="sm" onClick={editor.cancel}>{wording.dashboardCancel}</Button>
              <Button size="sm" variant="primary" onClick={editor.done}>{wording.dashboardDone}</Button>
            </>
          ) : (
            <Button size="sm" onClick={editor.edit}>{wording.dashboardEdit}</Button>
          )}
        </div>
      )}
      {editing && total === 0 && <Text>{wording.dashboardEmptyEditing}</Text>}
      {!editing && total === 0 && <Text>{wording.dashboardEmpty}</Text>}
      <div className={styles.grid} ref={grid}>
        {shown.map(({ widget, type }, i) => {
          const style = placeStyle(places[i]!, sequence.indexOf(i));
          const title = titleOf(type, widget.options);
          const at = view.widgets.findIndex((one) => one.id === widget.id);
          const head = headOf(widget, title, i, at);
          const menu = editing && menuOf(widget, type, title, i, at);
          if (type === builtin) {
            return (
              <div key={widget.id} ref={track(cards, widget.id)} className={cx(styles.item, styles.headingRow)} style={style} data-widget={widget.id} data-editing={editing || undefined} data-dragging={drag?.id === widget.id || undefined}>
                <div {...head} className={cx(head.className, styles.headingHead)}>
                  {editing && <GripGlyph className={styles.grip} />}
                  <Heading level={2} size="lg" className={styles.heading}>{(widget.options as HeadingOptions).text}</Heading>
                  {menu}
                </div>
              </div>
            );
          }
          return (
            <Card key={widget.id} ref={track(cards, widget.id)} className={styles.item} style={style} data-widget={widget.id} data-editing={editing || undefined} data-dragging={drag?.id === widget.id || undefined} aria-label={title}>
              <div {...head}>
                {editing && <GripGlyph className={styles.grip} />}
                <h2 className={styles.title}>{title}</h2>
                {editing && <span className={styles.size}>{wording.dashboardSizes[widget.size]}</span>}
                {menu}
              </div>
              <Body title={title} editing={editing}><Failed size={widget.size} options={widget.options} fallback={<Text tone="secondary">{wording.dashboardFailed}</Text>}><Suspense fallback={<Skeleton width="100%" height="100%" />}><Content render={type.children} size={widget.size} options={widget.options} /></Suspense></Failed></Body>
            </Card>
          );
        })}
        {held >= 0 && <div ref={placeholder} aria-hidden="true" data-placeholder className={cx(styles.item, styles.placeholder)} style={placeStyle(places[held]!, drag!.target)} />}
      </div>
      <Drawer open={editor.catalogue} onClose={() => editor.setCatalogue(false)}>
        <ModalHeader title={wording.dashboardCatalogue} description={wording.dashboardCatalogueSentence} />
        <ModalBody>
          <ul className={styles.catalogue}>
            {listed.map((type) => {
              const span = type.sizes[type.start]!;
              return (
                <li key={type.name} className={styles.entry}>
                  <div className={styles.footprint} role="img" aria-label={wording.dashboardFootprint(span.columns, span.rows)}>
                    <span style={{ width: `${(span.columns / COLUMNS) * 100}%`, height: `${Math.min(1, span.rows / 4) * 100}%` }} />
                  </div>
                  <div className={styles.entryText}>
                    <Text as="strong" weight="semibold">{type.label}</Text>
                    <Text as="span" size="sm" tone="secondary">{type.sentence}</Text>
                  </div>
                  <Button size="sm" aria-label={wording.dashboardAddType(type.label)} onClick={() => addType(type)}>{wording.dashboardAdd}</Button>
                </li>
              );
            })}
          </ul>
        </ModalBody>
      </Drawer>
      {optionsType?.form && optionsWidget && (
        <Popover open anchorRef={anchor} align="end" onOpenChange={() => setOptionsFor(null)} role="dialog" aria-label={wording.dashboardOptions}>
          <div className={styles.options}>
            {optionsType.form({
              options: optionsWidget.options,
              change: (options) => {
                editor.step(setOptions(optionsWidget.id, options));
                announce(wording.dashboardOptionsChanged(titleOf(optionsType, options)));
              },
            })}
          </div>
        </Popover>
      )}
    </div>
  );
}
