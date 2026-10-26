import { Grid, Stat } from "../../../src";
import type { FreshnessAges, LimitSet } from "../../../src";

export const title = "Say how far the source vouches for a value";
export const lead = "Pass `quality` – `good`, `uncertain` or `bad`, the severities of an OPC UA status code – and the tile says so in a word and a line under the figure. The number and the verdict stay; mapping a status code to a level is the application's.";

/* Distances from the moment the page loaded, so the tiles always read the same. */
const LOADED = Date.now();
const MIN = 60_000;

const AGES: FreshnessAges = { stale: 2 * MIN, lost: 10 * MIN };

/** The same limits for every tile: warn from 820 °C, alarm from 860 °C. */
const FURNACE: LimitSet = {
  limits: [
    { value: 820, side: "upper", severity: "warning" },
    { value: 860, side: "upper", severity: "alarm" },
  ],
};

export default function SourceQuality() {
  return (
    <Grid minItemWidth="200px" gap={4}>
      <Stat label="Furnace 1 · good" value={805} unit="°C" decimals={0} limits={FURNACE} quality="good" />
      <Stat label="Furnace 2 · uncertain" value={812} unit="°C" decimals={0} limits={FURNACE} quality="uncertain" />
      <Stat label="Furnace 3 · bad, in alarm" value={905} unit="°C" decimals={0} limits={FURNACE} quality="bad" />
      <Stat
        label="Furnace 4 · bad and stale"
        value={841}
        unit="°C"
        decimals={0}
        limits={FURNACE}
        quality="bad"
        asOf={LOADED - 4 * MIN}
        ages={AGES}
      />
    </Grid>
  );
}
