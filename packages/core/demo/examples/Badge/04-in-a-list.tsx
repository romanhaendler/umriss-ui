import { Badge, Stack, Text } from "../../../src";
import type { BadgeTone } from "../../../src";

/* Data from the planning world, written out here so the example runs on its own. */
const at = (day: number, hours = 9, minutes = 0) => new Date(2026, 2, day, hours, minutes).getTime();

/** A work item, shaped as `@umriss-ui/schedule`'s `Subtask`. */
interface WorkItem {
  id: string;
  /** The project. */
  task: string;
  /** The person. */
  lane: string;
  from: number;
  to: number;
  name: string;
  sprint: string;
  /** Hours, as estimated at planning. */
  estimate: number;
  status: "to do" | "in progress" | "in review" | "done";
}

const item = (id: string, task: string, lane: string, from: number, to: number, name: string, estimate: number, status: WorkItem["status"]): WorkItem =>
  ({ id, task, lane, from, to, name, sprint: "sprint-14", estimate, status });

const WORK: readonly WorkItem[] = [
  item("w-101", "portal", "arjun", at(9), at(11, 17), "Sign-in with e-mail code", 18, "done"),
  item("w-102", "portal", "arjun", at(12), at(17, 17), "Profile page", 26, "in progress"),
  item("w-103", "portal", "chloe", at(9), at(10, 17), "Session handling", 12, "done"),
  item("w-104", "shop", "chloe", at(11), at(13, 17), "Basket keeps items across devices", 20, "in review"),
  item("w-105", "portal", "chloe", at(16), at(19, 17), "Change of address form", 24, "in progress"),
  item("w-106", "portal", "noah", at(9), at(12, 13), "Profile page design", 14, "done"),
  item("w-107", "shop", "noah", at(16), at(18, 17), "Search results layout", 12, "to do"),
  item("w-108", "portal", "eva", at(12), at(13, 17), "Test plan for sign-in", 10, "done"),
  item("w-109", "portal", "eva", at(17), at(20, 17), "Regression run", 20, "to do"),
  item("w-110", "booking", "hana", at(9), at(13, 17), "Reminder scheduling service", 32, "done"),
  item("w-111", "booking", "hana", at(16), at(20, 17), "Push notifications", 30, "in progress"),
  item("w-112", "booking", "kofi", at(10), at(12, 17), "Calendar sync", 18, "done"),
  item("w-113", "intranet", "kofi", at(16), at(18, 17), "News feed", 16, "in progress"),
  item("w-114", "booking", "freya", at(9), at(11, 17), "Reminder settings screen", 16, "done"),
  item("w-115", "booking", "freya", at(18), at(20, 17), "Store screenshots", 12, "to do"),
  item("w-116", "booking", "david", at(16), at(19, 13), "Device test matrix", 14, "to do"),
];

export const title = "Mark the state of each row";
export const lead = "In a list the badges line up in one column, so the eye runs down the states without reading every title.";

const TONE: Record<WorkItem["status"], BadgeTone> = {
  "to do": "neutral",
  "in progress": "accent",
  "in review": "warning",
  done: "success",
};

export default function InAList() {
  return (
    <Stack gap={2} style={{ maxWidth: 520 }}>
      {WORK.filter((item) => item.task === "portal").map((item) => (
        <Stack key={item.id} direction="row" gap={3} align="center">
          <Text as="span" size="sm" mono tone="muted">
            {item.id}
          </Text>
          <Text as="span" size="sm" style={{ flex: 1 }}>
            {item.name}
          </Text>
          <Badge tone={TONE[item.status]}>{item.status}</Badge>
        </Stack>
      ))}
    </Stack>
  );
}
