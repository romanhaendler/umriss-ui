import { useState } from "react";
import { FormField, Grid, Select } from "../../../src";

export const title = "The native select, with a clear button";

/* The native element, in the library's appearance. It is right where the list
   is short: the system's own control - a wheel on the phone, the keyboard on the
   desktop - is better than anything home-made.

   Whoever should be able to type wants a `Combobox`; whoever should be able to
   choose several wants a `MultiSelect`.

   The size prop is called `selectSize` and not `size`, because on the native
   element `<select size>` is the number of visible rows. */
export default function NativeSelect() {
  const [role, setRole] = useState("");

  return (
    <Grid minItemWidth="240px" gap={4}>
      <FormField label="Role" hint="With a clear button; it appears once a choice has been made.">
        <Select
          clearable
          value={role}
          onChange={(event) => setRole(event.target.value)}
          onClear={() => setRole("")}
        >
          <option value="" disabled>
            Choose a role
          </option>
          <option value="admin">Administrator</option>
          <option value="editor">Editor</option>
          <option value="reader">Read only</option>
        </Select>
      </FormField>
      <FormField label="Compact" hint="Compact size (sm).">
        <Select selectSize="sm" defaultValue="editor">
          <option value="admin">Administrator</option>
          <option value="editor">Editor</option>
        </Select>
      </FormField>
      <FormField label="Disabled" hint="Deactivated.">
        <Select disabled defaultValue="admin">
          <option value="admin">Administrator</option>
        </Select>
      </FormField>
    </Grid>
  );
}
