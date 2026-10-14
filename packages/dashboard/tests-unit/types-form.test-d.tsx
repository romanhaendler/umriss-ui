/* The typing of a type's form, checked by the compiler as part of `typecheck`.
   The line under `@ts-expect-error` MUST yield an error. */

import { useDashboard } from "../src";

export function Form() {
  const { Dashboard, WidgetType } = useDashboard({ defaultView: { widgets: [] } });
  return (
    <Dashboard aria-label="Start">
      <WidgetType
        name="figure"
        label="Figure"
        sentence="One."
        sizes={{ small: { columns: 3, rows: 2 } }}
        start="small"
        defaultOptions={{ name: "Orders" }}
        form={({ options, change }) => <input value={options.name} onChange={(event) => change({ name: event.target.value })} />}
      >
        {() => null}
      </WidgetType>
      <WidgetType
        name="wrong"
        label="Wrong"
        sentence="One."
        sizes={{ small: { columns: 3, rows: 2 } }}
        start="small"
        defaultOptions={{ name: "Orders" }}
        form={({ change }) => (
          // @ts-expect-error - a change takes the options' type: no `places`.
          <button onClick={() => change({ places: 1 })} />
        )}
      >
        {() => null}
      </WidgetType>
    </Dashboard>
  );
}
