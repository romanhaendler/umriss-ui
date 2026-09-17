import { useState } from "react";
import { Checkbox, Stack } from "../../../src";

export const title = "Three states";

/* The third state is the reason for this component: `indeterminate` is the
   parent of partly checked children. It is never a value a click produces - it
   is always derived and never stored, and a click on it turns it into "all" or
   "none".

   The disabled AND checked case is deliberately missing here: `Checkbox`
   currently shows it as an empty box, because `.input:disabled + .box` resets
   the background to the sunken surface and the check in `currentColor` becomes
   invisible on it. That is a finding about the library and not a statement
   about the states - an example showing it would document the defect instead of
   the component. */
export default function States() {
  const [children, setChildren] = useState([true, false, true]);
  const all = children.every(Boolean);
  const none = children.every((c) => !c);

  return (
    <Stack gap={3} align="flex-start">
      <Checkbox
        label="All areas"
        checked={all}
        indeterminate={!all && !none}
        onChange={(event) => setChildren(children.map(() => event.target.checked))}
      />
      <Stack gap={2} style={{ paddingLeft: "var(--u-space-6)" }}>
        {["Analysis", "Backend", "Sales"].map((name, i) => (
          <Checkbox
            key={name}
            label={name}
            checked={children[i]}
            onChange={(event) =>
              setChildren((previous) => previous.map((c, j) => (i === j ? event.target.checked : c)))
            }
          />
        ))}
      </Stack>
      <Checkbox label="Disabled" disabled />
    </Stack>
  );
}
