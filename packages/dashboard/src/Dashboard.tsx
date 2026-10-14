import { Children, isValidElement } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { Card, CardBody, CardHeader } from "@umriss-ui/core";
import styles from "./Dashboard.module.css";
import type { DashboardView } from "./model";
import { pack } from "./pack";
import { WidgetType } from "./WidgetType";
import type { WidgetTypeProps } from "./WidgetType";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/** The grid never has more or fewer columns. */
const COLUMNS = 12;

/** The props of `Dashboard`. */
export interface DashboardProps extends HTMLAttributes<HTMLDivElement> {
  /** The `WidgetType`s of this dashboard. */
  children?: ReactNode;
}

type AnyType = WidgetTypeProps<unknown>;

/** The Dashboard of `useDashboard`, drawing a view. */
export function DashboardOf({ view, className, children, ...rest }: DashboardProps & { view: DashboardView }) {
  const types = new Map<string, AnyType>();
  for (const child of Children.toArray(children)) {
    if (isValidElement<AnyType>(child) && child.type === WidgetType) types.set(child.props.name, child.props);
  }
  const shown = view.widgets.flatMap((widget) => {
    const type = types.get(widget.type);
    const span = type?.sizes[widget.size];
    return type && span ? [{ widget, type, span }] : [];
  });
  const places = pack(shown.map((one) => one.span), COLUMNS);

  return (
    <div role="group" className={cx(styles.root, className)} {...rest}>
      <div className={styles.grid}>
        {shown.map(({ widget, type }, i) => {
          const place = places[i]!;
          const style = {
            "--column": place.column + 1,
            "--row": place.row + 1,
            "--columns": place.columns,
            "--rows": place.rows,
          } as CSSProperties;
          const title = type.title?.(widget.options) ?? type.label;
          return (
            <Card key={widget.id} className={styles.item} style={style} data-widget={widget.id} aria-label={title}>
              <CardHeader title={title} />
              <CardBody className={styles.body}>{type.children({ size: widget.size, options: widget.options })}</CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
