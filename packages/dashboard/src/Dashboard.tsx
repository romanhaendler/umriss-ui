import { Children, isValidElement, useEffect, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { announce, Button, Card, CardBody, CardHeader, Drawer, Menu, MenuItem, MenuSeparator, ModalBody, ModalHeader, Popover, useWording } from "@umriss-ui/core";
import { add, move, newId, remove, resize, setOptions } from "./edit";
import type { Editor } from "./useDashboard";
import styles from "./Dashboard.module.css";
import { Failed } from "./Failed";
import { readView } from "./model";
import type { DashboardView, WidgetSize } from "./model";
import { pack } from "./pack";
import { WidgetType } from "./WidgetType";
import type { WidgetContent, WidgetTypeProps } from "./WidgetType";

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

/** The Dashboard of `useDashboard`, drawing a view. */
export function DashboardOf({ view: given, editor, className, children, catalogue, ...rest }: DashboardProps & { view: DashboardView; editor: Editor }) {
  const wording = useWording();
  const types = new Map<string, AnyType>();
  for (const child of Children.toArray(children)) {
    if (isValidElement<AnyType>(child) && child.type === WidgetType) types.set(child.props.name, child.props);
  }
  const { register } = editor;
  useEffect(() => register(types));
  const view = readView(given, types);
  const shown = view.widgets.flatMap((widget) => {
    const type = types.get(widget.type);
    const span = type?.sizes[widget.size];
    return type && span ? [{ widget, type, span }] : [];
  });
  const places = pack(shown.map((one) => one.span), COLUMNS);

  const [optionsFor, setOptionsFor] = useState<string | null>(null);
  const anchor = useRef<HTMLElement | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const added = useRef<string | null>(null);
  useEffect(() => {
    if (!added.current) return;
    grid.current?.querySelector(`[data-widget="${added.current}"]`)?.scrollIntoView?.({ block: "nearest" });
    added.current = null;
  });

  const { editing } = editor;
  const total = view.widgets.length;
  const area = (span: { columns: number; rows: number }) => span.columns * span.rows;
  const fraction = (columns: number) => {
    const divisor = (a: number, b: number): number => (b === 0 ? a : divisor(b, a % b));
    return `${columns / divisor(columns, COLUMNS)}/${COLUMNS / divisor(columns, COLUMNS)}`;
  };
  const listed = [...types.values()].filter((type) => !catalogue || catalogue.includes(type.name));
  const addType = (type: AnyType) => {
    const widget = { id: newId(view, type.name), type: type.name, size: type.start, options: type.defaultOptions };
    added.current = widget.id;
    editor.step(add(widget));
    announce(wording.dashboardAdded(type.title?.(widget.options) ?? type.label, total + 1, total + 1));
  };
  const optionsType = optionsFor ? types.get(view.widgets.find((widget) => widget.id === optionsFor)?.type ?? "") : undefined;
  const optionsWidget = view.widgets.find((widget) => widget.id === optionsFor);
  const moveTo = (id: string, title: string, to: number) => {
    const from = view.widgets.findIndex((widget) => widget.id === id);
    const target = Math.max(0, Math.min(total - 1, to));
    if (from === target) return;
    editor.step(move(id, target));
    announce(wording.dashboardMoved(title, from + 1, target + 1, total));
  };

  return (
    <div role="group" className={cx(styles.root, className)} {...rest}>
      {editor.allowed && (
        <div className={styles.bar}>
          {editing ? (
            <>
              <span className={styles.mode}>{wording.dashboardEditing}</span>
              <Button size="sm" onClick={() => editor.setCatalogue(true)}>{wording.dashboardAddWidget}</Button>
              <Button size="sm" disabled={!editor.canUndo} onClick={() => { editor.undo(); announce(wording.dashboardUndone); }}>{wording.dashboardUndo}</Button>
              <Button size="sm" disabled={!editor.canRedo} onClick={() => { editor.redo(); announce(wording.dashboardRedone); }}>{wording.dashboardRedo}</Button>
              <Button size="sm" disabled={!editor.canReset} onClick={() => { editor.reset(); announce(wording.dashboardResetDone); }}>{wording.dashboardReset}</Button>
              <Button size="sm" onClick={() => { editor.cancel(); announce(wording.dashboardCancelled); }}>{wording.dashboardCancel}</Button>
              <Button size="sm" variant="primary" onClick={() => { editor.done(); announce(wording.dashboardKept); }}>{wording.dashboardDone}</Button>
            </>
          ) : (
            <Button size="sm" onClick={editor.edit}>{wording.dashboardEdit}</Button>
          )}
        </div>
      )}
      {editing && total === 0 && <p>{wording.dashboardEmptyEditing}</p>}
      {!editing && total === 0 && <p>{wording.dashboardEmpty}</p>}
      <div className={styles.grid} ref={grid}>
        {shown.map(({ widget, type }, i) => {
          const place = places[i]!;
          const style = {
            "--column": place.column + 1,
            "--row": place.row + 1,
            "--columns": place.columns,
            "--rows": place.rows,
          } as CSSProperties;
          const title = type.title?.(widget.options) ?? type.label;
          const at = view.widgets.findIndex((one) => one.id === widget.id);
          const sizes = Object.entries(type.sizes).sort(([, a], [, b]) => area(a) - area(b));
          const head = editing
            ? {
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
            : {};
          return (
            <Card key={widget.id} className={styles.item} style={style} data-widget={widget.id} data-editing={editing || undefined} aria-label={title}>
              <CardHeader
                title={title}
                {...head}
                actions={
                  editing && (
                    <Menu
                      align="end"
                      trigger={
                        <Button size="sm" variant="ghost" aria-label={wording.dashboardMenu(title)}>
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
                          {sizes.map(([name, span]) => {
                            const label = wording.dashboardSizes[name as WidgetSize];
                            return (
                              <MenuItem
                                key={name}
                                aria-current={name === widget.size || undefined}
                                onSelect={() => {
                                  editor.step(resize(widget.id, name as WidgetSize));
                                  announce(wording.dashboardResized(title, label));
                                }}
                              >
                                {`${name === widget.size ? "✓ " : ""}${label}, ${wording.dashboardShare(fraction(span.columns))}`}
                              </MenuItem>
                            );
                          })}
                        </>
                      )}
                      {type.form && (
                        <>
                          <MenuSeparator />
                          <MenuItem
                            onSelect={() => {
                              anchor.current = grid.current?.querySelector<HTMLElement>(`[data-widget="${widget.id}"] button[aria-label="${wording.dashboardMenu(title)}"]`) ?? null;
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
                          editor.step(remove(widget.id));
                          announce(wording.dashboardRemoved(title));
                        }}
                      >
                        {wording.dashboardRemove}
                      </MenuItem>
                    </Menu>
                  )
                }
              />
              <CardBody className={styles.body} inert={editing}><Failed fallback={<p>{wording.dashboardFailed}</p>}><Content render={type.children} size={widget.size} options={widget.options} /></Failed></CardBody>
            </Card>
          );
        })}
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
                    <strong>{type.label}</strong>
                    <span>{type.sentence}</span>
                  </div>
                  <Button size="sm" aria-label={wording.dashboardAddType(type.label)} onClick={() => addType(type)}>{wording.dashboardAdd}</Button>
                </li>
              );
            })}
          </ul>
        </ModalBody>
      </Drawer>
      {optionsType?.form && optionsWidget && (
        <Popover open anchorRef={anchor} onOpenChange={() => setOptionsFor(null)} role="dialog" ariaLabel={wording.dashboardOptions}>
          {optionsType.form({
            options: optionsWidget.options,
            change: (options) => {
              editor.step(setOptions(optionsWidget.id, options));
              announce(wording.dashboardOptionsChanged(optionsType.title?.(options) ?? optionsType.label));
            },
          })}
        </Popover>
      )}
    </div>
  );
}
