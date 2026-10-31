import { useState } from "react";
import { Button, FormField, RangeSlider, Stack, Text } from "../../../src";

export const title = "In a form";
export const lead = "With a `name` the two ends are posted as `<name>Start` and `<name>End`; a reset puts them back.";

export default function InAForm() {
  const [posted, setPosted] = useState("");
  return (
    <form
      style={{ maxWidth: 360 }}
      onSubmit={(event) => {
        event.preventDefault();
        setPosted(new URLSearchParams(new FormData(event.currentTarget) as never).toString());
      }}
    >
      <Stack gap={3}>
        <FormField label="Shift hours">
          <RangeSlider name="shift" min={0} max={24} defaultValue={[6, 14]} />
        </FormField>
        <FormField label="Price window, €" hint="Posted as min and max, named through the two name props.">
          <RangeSlider startName="min" endName="max" min={0} max={500} step={10} defaultValue={[50, 250]} />
        </FormField>
        <Stack direction="row" gap={2}>
          <Button type="submit">Save</Button>
          <Button type="reset" variant="ghost">Reset</Button>
        </Stack>
        {posted && <Text size="sm">{posted}</Text>}
      </Stack>
    </form>
  );
}
