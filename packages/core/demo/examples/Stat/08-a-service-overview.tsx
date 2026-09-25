import { Card, CardBody, CardHeader, Grid, Stat } from "../../../src";
import type { FreshnessAges, LimitSet } from "../../../src";
import { SERVICES, metrics } from "@umriss-ui/demo/worlds/operations";
import type { Service } from "@umriss-ui/demo/worlds/operations";

export const title = "Watch the services that page at night";
export const lead = "A row of tiles per service, each read against its own objective, with the last two hours beneath and a freshness for the feed.";

const LOADED = Date.now();
const AGES: FreshnessAges = { stale: 2 * 60_000, lost: 10 * 60_000 };

/** Warn at 80 % of the latency objective, alarm at the objective. */
function latency(service: Service): LimitSet {
  return {
    limits: [
      { value: service.latencySlo * 0.8, side: "upper", severity: "warning" },
      { value: service.latencySlo, side: "upper", severity: "alarm" },
    ],
  };
}

const ERRORS: LimitSet = {
  limits: [
    { value: 1, side: "upper", severity: "warning" },
    { value: 2, side: "upper", severity: "alarm" },
  ],
};

export default function AServiceOverview() {
  return (
    <Grid minItemWidth="320px" gap={4}>
      {SERVICES.filter((service) => service.tier === 1).map((service) => {
        const last = metrics(service.id).slice(-24);
        const now = last.at(-1);
        return (
          <Card key={service.id}>
            <CardHeader eyebrow={service.team} title={service.name} />
            <CardBody>
              <Grid minItemWidth="130px" gap={3}>
                <Stat
                  label="p95 latency"
                  value={now?.p95}
                  unit="ms"
                  decimals={0}
                  limits={latency(service)}
                  history={last.map((point) => point.p95)}
                  asOf={LOADED - 40_000}
                  ages={AGES}
                />
                <Stat
                  label="Error rate"
                  value={now?.errorRate}
                  unit="%"
                  decimals={2}
                  limits={ERRORS}
                  history={last.map((point) => point.errorRate)}
                  asOf={LOADED - 40_000}
                  ages={AGES}
                />
              </Grid>
            </CardBody>
          </Card>
        );
      })}
    </Grid>
  );
}
