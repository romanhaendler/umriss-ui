/* `required` on the FormField tells the screen reader too (library-audit 04).

   The comment promised `aria-required` on the field; what was set was only the
   asterisk on the label, and that is `aria-hidden`. The context now carries the
   statement, and every field whose role may carry it sets it - just as it
   already sets `aria-describedby` and `aria-invalid` out of the same context.

   Not included are the triggers of the pickers and of the multi-select: those
   are buttons, and `aria-required` is not a permitted attribute on a button. */

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { FormField } from "../src/components/FormField";
import { Input } from "../src/components/Input";
import { Select } from "../src/components/Select";
import { RadioGroup } from "../src/components/RadioGroup";
import { Textarea } from "../src/components/Textarea";
import { NumberInput } from "../src/components/NumberInput";
import { Combobox } from "../src/components/Combobox";
import { Checkbox } from "../src/components/Checkbox";

const renderRequired = (field: ReactNode) =>
  render(
    <FormField label="Angabe" required>
      {field}
    </FormField>,
  );

describe("FormField required", () => {
  it.each<[string, ReactNode, string]>([
    ["Input", <Input key="i" />, "textbox"],
    [
      "Select",
      <Select key="s" defaultValue="a">
        <option value="a">A</option>
      </Select>,
      "combobox",
    ],
    ["RadioGroup", <RadioGroup key="r" options={[{ value: "a", label: "A" }]} />, "radiogroup"],
    ["Textarea", <Textarea key="t" />, "textbox"],
    ["NumberInput", <NumberInput key="n" value={null} onChange={() => undefined} />, "textbox"],
    ["Combobox", <Combobox key="c" options={[{ value: "a", label: "A" }]} value={null} onChange={() => undefined} />, "combobox"],
    ["Checkbox", <Checkbox key="x" />, "checkbox"],
  ])("sets aria-required on %s", (_name, field, role) => {
    renderRequired(field);
    // By the role alone: exactly one field stands there per test, and the radio
    // group is a div that `label for` does not name.
    expect(screen.getByRole(role).getAttribute("aria-required")).toBe("true");
  });

  it("sets nothing without required", () => {
    render(
      <FormField label="Angabe">
        <Input />
      </FormField>,
    );
    expect(screen.getByRole("textbox", { name: "Angabe" }).hasAttribute("aria-required")).toBe(false);
  });
});
