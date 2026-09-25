import { Sparkline, Text } from "../../../src";
import { SERVICES, metrics } from "@umriss-ui/demo/worlds/operations";

export const title = "Show a history per row";
export const lead = "In a table each row gets its line at row height, with the value and the objective in columns of their own.";

const ROWS = SERVICES.map((service) => {
  const p95 = metrics(service.id)
    .slice(-24)
    .map((point) => point.p95);
  return { service, p95, now: p95.at(-1)! };
});

const CELL = { padding: "var(--u-space-1) var(--u-space-3)", borderBottom: "1px solid var(--u-edge-color)" };

export default function InATable() {
  return (
    <table style={{ borderCollapse: "collapse", maxWidth: 560, width: "100%" }}>
      <thead>
        <tr>
          {["Service", "p95, last 2 h", "Now", "Objective"].map((head, i) => (
            <th key={head} style={{ ...CELL, textAlign: i >= 2 ? "right" : "left" }}>
              <Text as="span" size="xs" tone="muted">
                {head}
              </Text>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ROWS.map(({ service, p95, now }) => (
          <tr key={service.id}>
            <td style={CELL}>
              <Text as="span" size="sm">
                {service.name}
              </Text>
            </td>
            <td style={CELL}>
              <Sparkline data={p95} />
            </td>
            <td style={{ ...CELL, textAlign: "right" }}>
              <Text as="span" size="sm" mono>
                {now} ms
              </Text>
            </td>
            <td style={{ ...CELL, textAlign: "right" }}>
              <Text as="span" size="sm" mono tone="muted">
                {service.latencySlo} ms
              </Text>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
