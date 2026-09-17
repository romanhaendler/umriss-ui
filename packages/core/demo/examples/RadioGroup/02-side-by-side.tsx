import { useState } from "react";
import { FormField, Grid, RadioGroup } from "../../../src";

export const title = "Side by side, and disabled";

/* Horizontal, where the labels are short and need no description line.
   `disabled` on the group disables everything; individual possibilities are
   disabled on the option. */
export default function SideBySide() {
  const [view, setView] = useState("list");

  return (
    <Grid minItemWidth="240px" gap={4}>
      <FormField label="View">
        <RadioGroup
          orientation="horizontal"
          value={view}
          onChange={setView}
          options={[
            { value: "list", label: "List" },
            { value: "grid", label: "Grid" },
            { value: "timeline", label: "Timeline" },
          ]}
        />
      </FormField>
      <FormField label="Disabled" hint="The whole group deactivated.">
        <RadioGroup
          size="sm"
          disabled
          defaultValue="a"
          options={[
            { value: "a", label: "First" },
            { value: "b", label: "Second" },
          ]}
        />
      </FormField>
    </Grid>
  );
}
