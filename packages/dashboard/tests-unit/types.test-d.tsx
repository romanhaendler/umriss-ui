/* The typing, checked by the compiler. This file does not run; it is compiled,
   as part of `typecheck`. Every line under `@ts-expect-error` MUST yield an
   error. */

import { useDashboard } from "../src";

export function Options() {
  const { Dashboard, WidgetType } = useDashboard({ defaultView: { widgets: [] } });
  return (
    <Dashboard aria-label="Start">
      <WidgetType name="figure" label="Figure" sentence="One." sizes={{ small: { columns: 3, rows: 2 } }} start="small" defaultOptions={{ name: "Orders", places: 1 }}>
        {({ options }) => <span>{options.name.toUpperCase() + options.places.toFixed(1)}</span>}
      </WidgetType>
      <WidgetType name="wrong" label="Wrong" sentence="One." sizes={{ small: { columns: 3, rows: 2 } }} start="small" defaultOptions={{ name: "Orders" }}>
        {/* @ts-expect-error - the options are those of the default options: no `places`. */}
        {({ options }) => <span>{options.places}</span>}
      </WidgetType>
      {/* @ts-expect-error - a size is one of the closed set. */}
      <WidgetType name="big" label="Big" sentence="One." sizes={{ huge: { columns: 3, rows: 2 } }} start="small" defaultOptions={{}}>
        {() => null}
      </WidgetType>
    </Dashboard>
  );
}
