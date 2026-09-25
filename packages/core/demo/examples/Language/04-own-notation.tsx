import { Grid, LanguageProvider, Stack, Stat, Text } from "../../../src";
import type { LanguageOptions } from "../../../src";

export const title = "Write numbers in your own notation";
export const lead = "Formats are a register of their own: replace `number` and `count` for Swiss notation and every word stays English.";

/* Formatters are costly to build: one per number of decimals, made once. */
const swiss = new Map<number | undefined, Intl.NumberFormat>();
function number(n: number, decimals?: number) {
  let format = swiss.get(decimals);
  if (!format) {
    format = new Intl.NumberFormat("de-CH", { minimumFractionDigits: decimals, maximumFractionDigits: decimals ?? 10 });
    swiss.set(decimals, format);
  }
  return format.format(n);
}
const swissCount = new Intl.NumberFormat("de-CH");

const FORMATS: LanguageOptions["formats"] = {
  number,
  count: (n) => swissCount.format(n),
};

function Surface() {
  return (
    <Stack gap={3}>
      <Stat label="Engineering, actual March" value={196420.5} decimals={2} unit="CHF" />
      <Stat label="Invoices booked" value={1284} decimals={0} />
    </Stack>
  );
}

export default function OwnNotation() {
  return (
    <Grid minItemWidth="240px" gap={5}>
      <Stack gap={2}>
        <Text size="xs" tone="muted">
          The default notation
        </Text>
        <Surface />
      </Stack>
      <Stack gap={2}>
        <Text size="xs" tone="muted">
          Swiss notation, English words
        </Text>
        <LanguageProvider formats={FORMATS}>
          <Surface />
        </LanguageProvider>
      </Stack>
    </Grid>
  );
}
