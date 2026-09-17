import { Combobox, Grid, UmrissProvider, Stack, Stat, Text } from "../../../src";
import type { LimitSet } from "../../../src";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";

export const title = "The second language, taken whole";

/* English is what every component renders without a provider. German ships as
   well and is taken on purpose - as a subpath, so that an application which
   never imports it never pays for it, and one that does has written the
   language it wants into an import line (ADR-0019).

   The two halves below are the same three components. The left one stands
   without a provider, the right one inside a `UmrissProvider` that hands in the
   whole `GERMAN_WORDING`. Nothing else differs - no prop, no label of the
   caller's: the words that move are the ones the library says itself, and they
   all come out of one register.

   `language` is the prop, not `wording`. The provider sets five things, and
   formats and wording are one of them; `LanguageProvider` is the same seam
   alone, for a section rather than an application.

   The notation travels with it. Wording and formats are two registers, and
   since ADR-0024 both halves of German come out of the same import: the left
   side writes "1,284" and 17/03/2026, the right one "1.284" and 17.03.2026.
   Hand in only the wording and you get German words over English notation -
   which is what this library shipped until that decision, and what it looked
   like is exactly why it was made. */

const FURNACE: LimitSet = {
  target: 800,
  limits: [
    { value: 760, side: "lower", severity: "warning" },
    { value: 820, side: "upper", severity: "warning" },
  ],
};

const PEOPLE = [
  { value: "mw", label: "M. Weber" },
  { value: "jf", label: "J. Fontaine" },
  { value: "an", label: "A. Novak" },
];

/* One surface, twice. It takes no provider of its own - whoever renders it
   under one gets that one, and whoever renders it under none gets the
   defaults. That is the whole seam. */
function Surface() {
  return (
    <Stack gap={3}>
      <Stat label="Furnace 1" value={834} unit="°C" limits={FURNACE} />
      <Stat label="Furnace 2" value={null} unit="°C" limits={FURNACE} />
      <Stat label="Units this shift" value={1284} decimals={0} />
      <Combobox value={null} onChange={() => {}} clearable options={PEOPLE} />
    </Stack>
  );
}

export default function TheSecondLanguage() {
  return (
    <Grid minItemWidth="240px" gap={5}>
      <Stack gap={2}>
        <Text size="xs" tone="muted">
          Without a provider – DEFAULT_WORDING
        </Text>
        <Surface />
      </Stack>
      <Stack gap={2}>
        <Text size="xs" tone="muted">
          language=&#123;&#123; wording: GERMAN_WORDING, formats: GERMAN_FORMATS &#125;&#125;
        </Text>
        <UmrissProvider language={{ wording: GERMAN_WORDING, formats: GERMAN_FORMATS }}>
          <Surface />
        </UmrissProvider>
      </Stack>
    </Grid>
  );
}
