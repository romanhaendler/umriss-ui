import { Meter, Text } from "../../../src";
import type { MeterTone } from "../../../src";

export const title = "Compare a team's capacity";
export const lead = "In a table, one rule turns each share into a tone, and the hours beside the bar carry the value in words.";

/** The rule: fully booked is fine, over 100 % warns, over 120 % is a problem. */
function toneOf(share: number): MeterTone {
  if (share > 1.2) return "danger";
  if (share > 1) return "warning";
  return "neutral";
}

/** This week, 16 to 20 March: hours booked against hours available after leave. */
const ROWS = [
  { name: "Arjun Mehta", booked: 26, available: 16 },
  { name: "Chloe Durand", booked: 38, available: 40 },
  { name: "Noah Fischer", booked: 22, available: 24 },
  { name: "Hana Sato", booked: 44, available: 40 },
  { name: "Kofi Mensah", booked: 20, available: 32 },
  { name: "Freya Olsen", booked: 12, available: 24 },
].map((row) => ({ ...row, share: row.booked / row.available }));

const CELL = { padding: "var(--u-space-2) var(--u-space-3)", borderBottom: "1px solid var(--u-edge-color)" };

export default function TeamCapacity() {
  return (
    <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: 560 }}>
      <thead>
        <tr>
          <th style={{ ...CELL, textAlign: "left" }}>
            <Text as="span" size="xs" tone="muted">Person</Text>
          </th>
          <th style={{ ...CELL, textAlign: "left", width: "45%" }}>
            <Text as="span" size="xs" tone="muted">Booked this week</Text>
          </th>
          <th style={{ ...CELL, textAlign: "right" }}>
            <Text as="span" size="xs" tone="muted">Hours</Text>
          </th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map(({ name, booked, available, share }) => (
          <tr key={name}>
            <td style={CELL}>
              <Text as="span" size="sm">{name}</Text>
            </td>
            <td style={CELL}>
              <Meter value={share} tone={toneOf(share)} showLabel label={`Capacity booked, ${name}`} />
            </td>
            <td style={{ ...CELL, textAlign: "right" }}>
              <Text as="span" size="sm" mono>
                {booked} / {available}
              </Text>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
