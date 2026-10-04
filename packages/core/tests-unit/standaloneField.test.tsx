/* A field without a `FormField` (props-to-examples, the follow-up to 04).

   `invalid` by hand is "only necessary without `FormField`", as its JSDoc
   says - and there the caller names the field and ties its own message to it
   with `aria-label` and `aria-describedby`. Both have to reach the element
   that takes the focus. On the combobox family and the pickers the caller's
   rest goes to the wrapper (P1 of core-passthrough), so these two attributes,
   and `aria-labelledby` with them, are taken out of it for the field. */

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import * as core from "../src";

const noop = () => undefined;
const own = { "aria-label": "Vehicle", "aria-describedby": "reason", invalid: true } as const;

describe("A field without FormField", () => {
  it.each<[string, ReactElement, string]>([
    ["Input", <core.Input key="c" {...own} />, "textbox"],
    ["Textarea", <core.Textarea key="c" {...own} />, "textbox"],
    ["NumberInput", <core.NumberInput key="c" value={null} onChange={noop} {...own} />, "textbox"],
    ["Select", <core.Select key="c" {...own}><option>A</option></core.Select>, "combobox"],
    ["Switch", <core.Switch key="c" {...own} />, "switch"],
    ["Combobox", <core.Combobox key="c" options={[]} value={null} onChange={noop} {...own} />, "combobox"],
    ["MultiSelect", <core.MultiSelect key="c" options={[]} value={[]} onChange={noop} {...own} />, "button"],
    ["DatePicker", <core.DatePicker key="c" value={null} onChange={noop} {...own} />, "button"],
    ["DateTimePicker", <core.DateTimePicker key="c" value={null} onChange={noop} {...own} />, "button"],
    ["DateRangePicker", <core.DateRangePicker key="c" value={null} onChange={noop} {...own} />, "button"],
    ["DateTimeRangePicker", <core.DateTimeRangePicker key="c" value={null} onChange={noop} {...own} />, "button"],
  ])("%s takes its name and the caller's message on the field", (_name, field, role) => {
    render(
      <>
        {field}
        <p id="reason">Tour T-04 needs a vehicle.</p>
      </>,
    );
    const control = screen.getByRole(role, { name: "Vehicle", description: "Tour T-04 needs a vehicle." });
    expect(control.getAttribute("aria-invalid")).toBe("true");
  });
});
