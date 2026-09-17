import { useState } from "react";
import { DateRangePicker, FormField, Stack, Text, useFormats } from "../../../src";
import type { DateRange } from "../../../src";

export const title = "Two days, both inclusive";

/* Both ends lie at local midnight, both count inclusively, and `from` never lies
   behind `to`: a range dragged backwards is silently turned around. There is
   no error state the caller would have to handle - and therefore none he can
   forget.

   Two months side by side, and on hover the preview counts the days along.

   `DateRange` is `{ from, to }`. Both packages agree on that shape -
   `@umriss-ui/table` reads a chosen span out of it - which is why the two
   fields were renamed in one commit across both. */
export default function Span() {
  const [span, setSpan] = useState<DateRange | null>(null);
  const formats = useFormats();

  return (
    <Stack gap={3} style={{ maxWidth: "340px" }}>
      <FormField label="Reporting period" hint="Clicking backwards is allowed - the ends swap silently.">
        <DateRangePicker value={span} onChange={setSpan} clearable />
      </FormField>
      <Text size="xs" tone="muted" mono>
        {span === null ? "null" : `${formats.date(span.from)} - ${formats.date(span.to)}`}
      </Text>
    </Stack>
  );
}
