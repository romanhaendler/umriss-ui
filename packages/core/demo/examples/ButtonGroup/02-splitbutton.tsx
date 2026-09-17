import { useState } from "react";
import { MenuItem, MenuSeparator, SplitButton, Stack, Text } from "../../../src";

export const title = "SplitButton: one main action and its neighbours";

/* The main action is the one meant nine times out of ten. Everything else
   stands in the menu beside it - visible enough to be found, and far enough
   away not to be hit by accident. */
export default function SplitButtonExample() {
  const [last, setLast] = useState("-");

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={3} wrap align="center">
        <SplitButton
          variant="primary"
          onClick={() => setLast("Exported as CSV")}
          menu={
            <>
              <MenuItem onSelect={() => setLast("Exported as Excel")}>As Excel</MenuItem>
              <MenuItem onSelect={() => setLast("Exported as PDF")}>As PDF</MenuItem>
              <MenuSeparator />
              <MenuItem tone="danger" onSelect={() => setLast("Export discarded")}>
                Discard the export
              </MenuItem>
            </>
          }
        >
          Export
        </SplitButton>
        <SplitButton
          size="sm"
          onClick={() => setLast("Saved")}
          menu={
            <>
              <MenuItem onSelect={() => setLast("Saved as a draft")}>As a draft</MenuItem>
              <MenuItem onSelect={() => setLast("Saved as a template")}>As a template</MenuItem>
            </>
          }
        >
          Save
        </SplitButton>
        <SplitButton disabled menu={<MenuItem onSelect={() => {}}>Nothing</MenuItem>}>
          Disabled
        </SplitButton>
      </Stack>
      <Text size="xs" tone="muted">
        Last: {last}
      </Text>
    </Stack>
  );
}
