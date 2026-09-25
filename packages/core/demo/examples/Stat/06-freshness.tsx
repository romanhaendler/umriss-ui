import { Grid, Stack, Stat, Text, useFreshness } from "../../../src";
import type { FreshnessAges, LimitSet } from "../../../src";

export const title = "Show how fresh a value is";
export const lead = "With `asOf` and `ages` the tile says when its value turns stale or lost – and keeps its verdict, since the last value is still the best one.";

/* Distances from the moment the page loaded, so the three always read the same. */
const LOADED = Date.now();
const MIN = 60_000;

/** Stale after two minutes without a new value, lost after ten. */
const AGES: FreshnessAges = { stale: 2 * MIN, lost: 10 * MIN };

const CHECKOUT_P95: LimitSet = {
  limits: [
    { value: 240, side: "upper", severity: "warning" },
    { value: 300, side: "upper", severity: "alarm" },
  ],
};

function Caption({ asOf }: { asOf: number }) {
  const { freshness } = useFreshness(asOf, AGES);
  return (
    <Text size="xs" tone="muted">
      Feed: {freshness}
    </Text>
  );
}

export default function Freshness() {
  return (
    <Grid minItemWidth="200px" gap={4}>
      {[
        { name: "live", asOf: LOADED - 20_000 },
        { name: "delayed", asOf: LOADED - 4 * MIN },
        { name: "cut off", asOf: LOADED - 25 * MIN },
      ].map((feed) => (
        <Stack key={feed.name} gap={2}>
          <Stat label={`p95 latency · ${feed.name}`} value={318} unit="ms" decimals={0} limits={CHECKOUT_P95} asOf={feed.asOf} ages={AGES} />
          <Caption asOf={feed.asOf} />
        </Stack>
      ))}
    </Grid>
  );
}
