import { Fragment, useState } from "react";
import {
  Breadcrumb,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Combobox,
  ConfirmDialog,
  DatePicker,
  FormField,
  Grid,
  Heading,
  NumberInput,
  RadioGroup,
  Select,
  Slider,
  Stack,
  Switch,
  Text,
  useToast,
} from "../../src";
import { PEOPLE, SPRINTS } from "@umriss-ui/demo/worlds/planning";
import type { Person } from "@umriss-ui/demo/worlds/planning";

export const title = "Set up a team";

export const lead =
  "A team lead at Tidewell keeps the team's settings here: who is in it and for how many hours, how sprints run, and who hears about what.";

export const callouts = [
  "The trail above says whose settings these are, and leads back to the other teams.",
  "Each member's role and weekly hours are edited in place, and the team's total follows.",
  "Removing someone asks once, and names what happens to their planned work.",
  "The focus factor turns the team's hours into the hours a sprint can plan with, and says the result beside it.",
  "The save bar says how many changes are not saved yet; Save and Discard act only then, and saving is confirmed by a toast.",
];

export const builtFrom = [
  "breadcrumb",
  "card",
  "select",
  "numberinput",
  "combobox",
  "confirmdialog",
  "radiogroup",
  "datepicker",
  "checkbox",
  "slider",
  "switch",
  "toast",
];

type Role = Person["role"];
type Member = Pick<Person, "id" | "name" | "role" | "capacity">;

const ROLES: readonly Role[] = ["Developer", "Designer", "Product manager", "QA engineer"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
const NEXT = SPRINTS.find((one) => one.name === "Sprint 15")!;

interface Settings {
  members: readonly Member[];
  length: "1" | "2" | "3";
  start: number;
  days: readonly string[];
  focus: number;
  notify: { review: boolean; overbooked: boolean; leave: boolean };
}

const INITIAL: Settings = {
  members: PEOPLE.filter((one) => one.team === "Web").map(({ id, name, role, capacity }) => ({ id, name, role, capacity })),
  length: "2",
  start: NEXT.from,
  days: DAYS,
  focus: 70,
  notify: { review: true, overbooked: true, leave: false },
};

/* How many settings differ from the saved ones - what the save bar says. */
function changes(a: Settings, b: Settings): number {
  const keys = ["length", "start", "days", "focus", "notify"] as const;
  const members = new Set([...a.members, ...b.members].map((one) => one.id));
  const memberChanges = [...members].filter(
    (id) => JSON.stringify(a.members.find((m) => m.id === id)) !== JSON.stringify(b.members.find((m) => m.id === id)),
  ).length;
  return memberChanges + keys.filter((key) => JSON.stringify(a[key]) !== JSON.stringify(b[key])).length;
}

export default function SetUpATeam() {
  const { toast } = useToast();
  const [saved, setSaved] = useState(INITIAL);
  const [draft, setDraft] = useState(INITIAL);
  const [removing, setRemoving] = useState<Member | null>(null);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const setMember = (id: string, patch: Partial<Member>) =>
    set("members", draft.members.map((one) => (one.id === id ? { ...one, ...patch } : one)));

  const hours = draft.members.reduce((sum, one) => sum + one.capacity, 0);
  const weeks = Number(draft.length);
  const plannable = Math.round((hours * weeks * draft.focus * draft.days.length) / 100 / 5);
  const pending = changes(saved, draft);
  const outside = PEOPLE.filter((one) => !draft.members.some((m) => m.id === one.id));

  return (
    <Stack gap={4}>
      <Stack gap={1} data-callout="1">
        <Breadcrumb items={[{ label: "Settings", href: "#/scenarios" }, { label: "Teams", href: "#/scenarios" }, { label: "Web" }]} />
        <Heading level={2} size="lg">
          Team Web
        </Heading>
      </Stack>

      <Card>
        <CardHeader title="Members" />
        <CardBody>
          <div style={{ overflowX: "auto" }}>
          <div style={{ display: "grid", minWidth: "30rem", gridTemplateColumns: "minmax(8rem, 1.2fr) minmax(9rem, 1fr) 8.5rem auto", gap: "var(--u-space-2) var(--u-space-3)", alignItems: "center" }}>
            <Text size="xs" tone="muted">Name</Text>
            <Text size="xs" tone="muted">Role</Text>
            <Text size="xs" tone="muted">Hours a week</Text>
            <span />
            {draft.members.map((one, i) => (
              <Fragment key={one.id}>
                <Text size="sm">{one.name}</Text>
                <Select
                  selectSize="sm"
                  aria-label={`Role of ${one.name}`}
                  data-callout={i === 0 ? "2" : undefined}
                  value={one.role}
                  onChange={(event) => setMember(one.id, { role: event.target.value as Role })}
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </Select>
                <NumberInput
                  size="sm"
                  aria-label={`Hours a week of ${one.name}`}
                  value={one.capacity}
                  onChange={(value) => setMember(one.id, { capacity: value ?? 0 })}
                  min={0}
                  max={40}
                  decimals={0}
                  suffix="h"
                />
                <Button size="sm" variant="ghost" data-callout={i === 0 ? "3" : undefined} onClick={() => setRemoving(one)}>
                  Remove
                </Button>
              </Fragment>
            ))}
          </div>
          </div>
          <Stack direction="row" gap={3} align="flex-end" justify="space-between" wrap style={{ marginTop: "var(--u-space-4)" }}>
            <FormField label="Add someone" style={{ flex: "0 1 280px" }}>
              <Combobox
                value={null}
                onChange={(id) => {
                  const person = PEOPLE.find((one) => one.id === id);
                  if (person) set("members", [...draft.members, { id: person.id, name: person.name, role: person.role, capacity: person.capacity }]);
                }}
                placeholder="Type a name"
                options={outside.map((one) => ({ value: one.id, label: `${one.name} · ${one.team}` }))}
              />
            </FormField>
            <Text size="sm" tone="secondary">
              {draft.members.length} people · {hours} hours a week
            </Text>
          </Stack>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Sprints" />
        <CardBody>
          <Grid minItemWidth="260px" gap={5}>
            <FormField label="Sprint length">
              <RadioGroup
                value={draft.length}
                onChange={(value) => set("length", value)}
                options={[
                  { value: "1", label: "One week" },
                  { value: "2", label: "Two weeks", description: "Planning on the first Monday, review on the second Friday." },
                  { value: "3", label: "Three weeks" },
                ]}
              />
            </FormField>
            <Stack gap={4}>
              <FormField label="Next sprint starts" hint={`${NEXT.name}: ${NEXT.goal}.`}>
                <DatePicker value={new Date(draft.start)} onChange={(date) => date && set("start", date.getTime())} />
              </FormField>
              <FormField label="Working days">
                <Stack direction="row" gap={3} wrap>
                  {DAYS.map((d) => (
                    <Checkbox
                      key={d}
                      label={d}
                      checked={draft.days.includes(d)}
                      onChange={(event) =>
                        set("days", event.target.checked ? DAYS.filter((x) => x === d || draft.days.includes(x)) : draft.days.filter((x) => x !== d))
                      }
                    />
                  ))}
                </Stack>
              </FormField>
              <FormField
                label="Focus factor"
                hint={`${plannable} of ${Math.round((hours * weeks * draft.days.length) / 5)} hours a sprint can be planned.`}
                data-callout="4"
              >
                <Slider
                  value={draft.focus}
                  onChange={(value) => set("focus", value)}
                  min={40}
                  max={100}
                  step={5}
                  showValue
                  format={(value) => `${value} %`}
                />
              </FormField>
            </Stack>
          </Grid>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Notifications" />
        <CardBody>
          <Stack gap={3}>
            <Switch
              label="Tell the team when work waits for review"
              checked={draft.notify.review}
              onChange={(event) => set("notify", { ...draft.notify, review: event.target.checked })}
            />
            <Switch
              label="Tell me when someone is planned beyond their hours"
              checked={draft.notify.overbooked}
              onChange={(event) => set("notify", { ...draft.notify, overbooked: event.target.checked })}
            />
            <Switch
              label="Tell me when leave overlaps planned work"
              checked={draft.notify.leave}
              onChange={(event) => set("notify", { ...draft.notify, leave: event.target.checked })}
            />
          </Stack>
        </CardBody>
      </Card>

      <Card data-callout="5">
        <CardBody>
          <Stack direction="row" gap={3} align="center" justify="space-between" wrap>
            <Text size="sm" tone={pending === 0 ? "muted" : "default"}>
              {pending === 0 ? "All changes saved" : pending === 1 ? "One change not saved yet" : `${pending} changes not saved yet`}
            </Text>
            <Stack direction="row" gap={2}>
              <Button size="sm" variant="ghost" disabled={pending === 0} onClick={() => setDraft(saved)}>
                Discard
              </Button>
              <Button
                size="sm"
                variant="primary"
                disabled={pending === 0}
                onClick={() => {
                  setSaved(draft);
                  toast({ title: "Team Web saved", tone: "success" });
                }}
              >
                Save
              </Button>
            </Stack>
          </Stack>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          set("members", draft.members.filter((one) => one.id !== removing!.id));
          setRemoving(null);
        }}
        tone="danger"
        title={`Remove ${removing?.name ?? ""} from Web?`}
        description="Their planned work stays on the plan without a person, until someone else takes it."
        confirmLabel="Remove"
      />
    </Stack>
  );
}
