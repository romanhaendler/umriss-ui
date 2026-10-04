/* The stage's own state for a field that is always controlled - a picker, a
   combobox. The configurator passes the `value` its declaration starts with;
   from there the field keeps what the reader chooses, as the reader's own
   `useState` would, so a cross or a choice is not a dead click. A `.ts`
   file, so `configurators/*.tsx` does not read it as a configurator. */

import { createElement, useState, type ComponentType } from "react";

export function keep<P extends { value: unknown }>(Component: ComponentType<P>) {
  return function Kept(props: P) {
    const [value, setValue] = useState(props.value);
    return createElement(Component, { ...props, value, onChange: setValue });
  };
}
