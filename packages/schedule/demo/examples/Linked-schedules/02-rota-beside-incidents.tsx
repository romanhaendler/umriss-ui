import { useState } from "react";
import { Stack } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";
import { ENGINEERS, INCIDENTS, NOW, ONCALL, SERVICES } from "@umriss-ui/demo/worlds/operations";

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
