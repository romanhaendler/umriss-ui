import { useState } from "react";
import { Button, ColorPicker, FormField, Grid, Stack, Text } from "../../../src";

export const title = "In a form";
export const lead =
  "Give the field a `name` and a plain `<form>` - or a React 19 `<form action>` - receives the colour as lowercase `#rrggbb`, or an empty text when none is set; a disabled field posts nothing. `formValue` writes it another way, `clearable` adds a cross and a Clear button, and a reset puts the default colour back.";

export default function InAForm() {
  const [posted, setPosted] = useState<string[]>([]);

  return (
    <form
      action={(data) => setPosted([...data.entries()].map(([name, value]) => `${name} = ${String(value)}`))}
      style={{ maxWidth: 560 }}
    >
      <Stack gap={4}>
        <Grid minItemWidth="220px" gap={4}>
          <FormField label="Brand colour">
            <ColorPicker name="accent" defaultValue="#2563eb" clearable />
          </FormField>
          <FormField label="Line, without the hash">
            <ColorPicker name="line" defaultValue="#161618" formValue={(hex) => hex.slice(1)} />
          </FormField>
          <FormField label="Highlight" hint="Empty, so it posts an empty text.">
            <ColorPicker name="highlight" clearable />
          </FormField>
          <FormField label="Set by the theme" hint="Locked, so it posts nothing.">
            <ColorPicker name="locked" defaultValue="#059669" disabled />
          </FormField>
        </Grid>
        <Stack direction="row" gap={3} align="center">
          <Button type="submit" variant="primary" size="sm">
            Send
          </Button>
          <Button type="reset" variant="ghost" size="sm">
            Reset
          </Button>
        </Stack>
        {posted.length > 0 && (
          <Text as="pre" size="sm" data-testid="posted" style={{ margin: 0 }}>
            {posted.join("\n")}
          </Text>
        )}
      </Stack>
    </form>
  );
}
