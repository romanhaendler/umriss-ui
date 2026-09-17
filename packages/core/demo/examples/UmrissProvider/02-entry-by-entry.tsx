import { Grid, LanguageProvider, Stack, Stat, Text } from "../../../src";
import type { LanguageOptions, LimitSet } from "../../../src";

export const title = "Entry by entry, and the formats beside it";

/* A whole language is the rare case. The usual one is an application that says
   one thing differently - and then changes ONE entry. Everything not named
   falls back on the default and never on an empty text or a key name: that is
   the difference between an incomplete translation and a broken surface.

   Two of the four verdict words are overridden below; the other two stand as
   they were. The plant speaks of a tolerance, so "OK" becomes "Within
   tolerance" - but a value nobody has is still "No value", because nothing was
   said about it here.

   `LanguageProvider` is the same seam as the provider's `language`, for a
   section rather than an application. Whoever needs only wording need not set
   a `UmrissProvider`.

   The formats are a register of their own, and they are the reason the numbers
   on this page read "1.284" everywhere else: they write `de-DE` whatever the
   wording says. Here they are moved too - and only here does the figure become
   "1,284".

   Both objects stand OUTSIDE the component. A provider that gets a new object
   on every render recomputes on every render. */

/* Built once and not per call, as in the library itself: formatters are
   expensive, and the parameterised one therefore sits behind a small cache. */
const britishNumbers = new Map<number | undefined, Intl.NumberFormat>();
const british = (n: number, decimals?: number) => {
  let format = britishNumbers.get(decimals);
  if (!format) {
    format = new Intl.NumberFormat("en-GB", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals ?? 10,
    });
    britishNumbers.set(decimals, format);
  }
  return format.format(n);
};
const britishCount = new Intl.NumberFormat("en-GB");

const FORMATS: LanguageOptions["formats"] = {
  number: british,
  count: (n) => britishCount.format(n),
};

const WORDING: LanguageOptions["wording"] = {
  verdictOk: "Within tolerance",
  verdictWarning: "Outside tolerance",
};

const FURNACE: LimitSet = {
  target: 800,
  limits: [
    { value: 760, side: "lower", severity: "warning" },
    { value: 820, side: "upper", severity: "warning" },
  ],
};

function Surface() {
  return (
    <Stack gap={3}>
      <Stat label="Furnace 1" value={798} unit="°C" limits={FURNACE} />
      <Stat label="Furnace 2" value={834} unit="°C" limits={FURNACE} />
      <Stat label="Furnace 3" value={null} unit="°C" limits={FURNACE} />
      <Stat label="Units this shift" value={1284} decimals={0} />
    </Stack>
  );
}

export default function EntryByEntry() {
  return (
    <Grid minItemWidth="240px" gap={5}>
      <Stack gap={2}>
        <Text size="xs" tone="muted">
          Untouched – the defaults
        </Text>
        <Surface />
      </Stack>
      <Stack gap={2}>
        <Text size="xs" tone="muted">
          Two entries and two formats moved
        </Text>
        <LanguageProvider formats={FORMATS} wording={WORDING}>
          <Surface />
        </LanguageProvider>
      </Stack>
    </Grid>
  );
}
