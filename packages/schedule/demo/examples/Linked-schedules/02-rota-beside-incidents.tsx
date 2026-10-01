import { useState } from "react";
import { Stack } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

/* Data from the operations world, written out here so the example runs on its own. */

const at = (day: number, hours: number, minutes = 0) => new Date(2026, 2, day, hours, minutes).getTime();

/** Tuesday, 17 March 2026, 10:30 - the moment the screens are read at. */
const NOW = at(17, 10, 30);

interface Service {
  id: string;
  name: string;
  team: string;
  /** 1 is customer-facing and pages at night; 3 waits for the morning. */
  tier: 1 | 2 | 3;
  /** The latency objective: the 95th percentile stays below this, in ms. */
  latencySlo: number;
  /** The availability promised for a month, in per cent. */
  availabilityTarget: number;
}

const SERVICES: readonly Service[] = [
  { id: "checkout", name: "Checkout", team: "Payments", tier: 1, latencySlo: 300, availabilityTarget: 99.95 },
  { id: "billing", name: "Billing", team: "Payments", tier: 1, latencySlo: 400, availabilityTarget: 99.9 },
  { id: "sign-in", name: "Sign-in", team: "Identity", tier: 1, latencySlo: 200, availabilityTarget: 99.95 },
  { id: "search", name: "Search", team: "Discovery", tier: 1, latencySlo: 250, availabilityTarget: 99.9 },
  { id: "images", name: "Image service", team: "Discovery", tier: 2, latencySlo: 500, availabilityTarget: 99.5 },
  { id: "notifications", name: "Notifications", team: "Messaging", tier: 2, latencySlo: 800, availabilityTarget: 99.5 },
  { id: "webhooks", name: "Webhooks", team: "Integrations", tier: 2, latencySlo: 1000, availabilityTarget: 99.5 },
  { id: "reports", name: "Reporting", team: "Insights", tier: 3, latencySlo: 2000, availabilityTarget: 99 },
];

interface Engineer {
  id: string;
  name: string;
  team: string;
}

const ENGINEERS: readonly Engineer[] = [
  { id: "priya", name: "Priya Raman", team: "Payments" },
  { id: "jonas", name: "Jonas Keller", team: "Payments" },
  { id: "ada", name: "Ada Mwangi", team: "Identity" },
  { id: "tomasz", name: "Tomasz Nowak", team: "Discovery" },
  { id: "leila", name: "Leila Haddad", team: "Discovery" },
  { id: "sam", name: "Sam Okafor", team: "Messaging" },
  { id: "ines", name: "Ines Duarte", team: "Integrations" },
  { id: "felix", name: "Felix Brandt", team: "Insights" },
];

interface OnCall {
  id: string;
  engineer: string;
  rotation: "primary" | "secondary";
  from: number;
  to: number;
}

/** Monday 16 to Monday 23 March, handed over every morning at 09:00: the
    secondary of one day is the primary of the next. */
const ONCALL: readonly OnCall[] = Array.from({ length: 7 }, (_, day) => [
  { rotation: "primary" as const, engineer: ENGINEERS[day % ENGINEERS.length]!.id },
  { rotation: "secondary" as const, engineer: ENGINEERS[(day + 1) % ENGINEERS.length]!.id },
].map(({ rotation, engineer }) => ({
  id: `${rotation}-${16 + day}`,
  engineer,
  rotation,
  from: at(16 + day, 9),
  to: at(17 + day, 9),
}))).flat();

interface Incident {
  id: string;
  title: string;
  service: string;
  severity: "SEV1" | "SEV2" | "SEV3";
  opened: number;
  acknowledged?: number;
  resolved?: number;
  /** An engineer's id. */
  assignee: string;
}

const INCIDENTS: readonly Incident[] = [
  { id: "INC-1048", title: "Checkout slow, card payments time out", service: "checkout", severity: "SEV1", opened: at(17, 9, 42), acknowledged: at(17, 9, 46), assignee: "jonas" },
  { id: "INC-1047", title: "Webhook deliveries delayed", service: "webhooks", severity: "SEV3", opened: at(17, 7, 15), acknowledged: at(17, 8, 2), assignee: "ines" },
  { id: "INC-1046", title: "Thumbnails missing for new uploads", service: "images", severity: "SEV2", opened: at(16, 22, 5), acknowledged: at(16, 22, 11), resolved: at(17, 0, 40), assignee: "tomasz" },
  { id: "INC-1045", title: "Sign-in codes arrive late", service: "sign-in", severity: "SEV2", opened: at(16, 14, 20), acknowledged: at(16, 14, 24), resolved: at(16, 15, 5), assignee: "ada" },
  { id: "INC-1044", title: "Monthly report export fails", service: "reports", severity: "SEV3", opened: at(15, 10, 0), acknowledged: at(16, 9, 12), resolved: at(16, 11, 30), assignee: "felix" },
  { id: "INC-1043", title: "Search returns no results for some regions", service: "search", severity: "SEV1", opened: at(14, 18, 30), acknowledged: at(14, 18, 33), resolved: at(14, 19, 55), assignee: "leila" },
  { id: "INC-1042", title: "Duplicate reminder e-mails", service: "notifications", severity: "SEV3", opened: at(13, 8, 45), acknowledged: at(13, 9, 30), resolved: at(13, 13, 0), assignee: "sam" },
  { id: "INC-1041", title: "Invoices generated twice", service: "billing", severity: "SEV2", opened: at(12, 16, 10), acknowledged: at(12, 16, 18), resolved: at(12, 18, 40), assignee: "priya" },
];

export const title = "Read a rota beside the incidents";

export const lead = "Two schedules with different lanes over one span: who was on call, above the incidents they were paged for.";

const day = (d: number, hours = 0) => new Date(2026, 2, d, hours).getTime();

const COLORS = [
  "light-dark(#2563eb, #6b9bff)",
  "light-dark(#0d9488, #3cc7b8)",
  "light-dark(#7c3aed, #a98bfa)",
  "light-dark(#c2410c, #f08a52)",
  "light-dark(#be185d, #f06aa6)",
  "light-dark(#4d7c0f, #8fc43e)",
  "light-dark(#0369a1, #5cb8f0)",
  "light-dark(#a16207, #e0b44a)",
];

/* Above, the engineer is the task and the rotation the lane. */
const PEOPLE: readonly Task[] = ENGINEERS.map((engineer, i) => ({ id: engineer.id, name: engineer.name, color: COLORS[i]! }));
const DUTIES: readonly Subtask[] = ONCALL.map((duty) => ({ id: duty.id, task: duty.engineer, lane: duty.rotation, from: duty.from, to: duty.to }));

/* Below, the severity is the task and the service the lane; an open incident runs to now. */
const SEVERITIES: readonly Task[] = [
  { id: "SEV1", name: "SEV1", color: "light-dark(#b91c1c, #f87171)" },
  { id: "SEV2", name: "SEV2", color: "light-dark(#c2410c, #f08a52)" },
  { id: "SEV3", name: "SEV3", color: "light-dark(#57534e, #a8a29e)" },
];
const PAGED: readonly Subtask[] = INCIDENTS.map((incident) => ({
  id: incident.id,
  task: incident.severity,
  lane: incident.service,
  from: incident.opened,
  to: incident.resolved ?? NOW,
  name: `${incident.id} ${incident.title}`,
}));
const HIT = SERVICES.filter((service) => PAGED.some((incident) => incident.lane === service.id));

export default function RotaBesideIncidents() {
  const [domain, setDomain] = useState<readonly [number, number]>([day(16, 6), day(17, 14)]);
  return (
    <Stack gap={2}>
      <Schedule ariaLabel="Who was on call" initialDomain={domain} height={140} onDomainChange={setDomain}>
        <Lane id="primary" label="Primary" />
        <Lane id="secondary" label="Secondary" />
        <Subtasks data={DUTIES} tasks={PEOPLE} />
      </Schedule>
      <Schedule ariaLabel="Incidents, the same hours" initialDomain={domain} height={290} onDomainChange={setDomain}>
        {HIT.map((service) => (
          <Lane key={service.id} id={service.id} label={service.name} />
        ))}
        <Subtasks data={PAGED} tasks={SEVERITIES} />
      </Schedule>
    </Stack>
  );
}
