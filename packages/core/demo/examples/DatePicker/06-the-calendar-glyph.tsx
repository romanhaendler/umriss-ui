import { CalendarGlyph, Stack, Text } from "../../../src";

export const title = "The calendar glyph";
export const lead = "`CalendarGlyph` is the leaf on the pickers' triggers; `range` adds the bar of the range pickers, `size` is in pixels.";

export default function TheCalendarGlyph() {
  return (
    <Stack gap={2}>
      <Text>
        <CalendarGlyph size={14} /> Delivery date
      </Text>
      <Text>
        <CalendarGlyph range size={14} /> Reporting period
      </Text>
    </Stack>
  );
}
