import { useRef, useState } from "react";
import { Button, Checkbox, Popover, Stack, Text } from "../../../src";

export const title = "Filter a list from a panel";
export const lead = "A small form in a popover: it applies on the button, gives focus back to its trigger and leaves the list in view.";

const DEPOTS = ["North depot", "Riverside depot", "East Gate depot"];

const SHIPMENTS = [
  { id: "SH-1042", customer: "Harlow Bakery", depot: "North depot" },
  { id: "SH-1051", customer: "Pine & Oak Florist", depot: "Riverside depot" },
  { id: "SH-1063", customer: "Moreau Optics", depot: "East Gate depot" },
  { id: "SH-1064", customer: "Quayside Books", depot: "East Gate depot" },
];

export default function AFilterPanel() {
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState<string[]>(DEPOTS);
  const [draft, setDraft] = useState<string[]>(DEPOTS);

  const toggle = (depot: string) =>
    setDraft((current) => (current.includes(depot) ? current.filter((d) => d !== depot) : [...current, depot]));

  return (
    <Stack gap={3} align="flex-start">
      <Button
        ref={anchor}
        aria-expanded={open}
        onClick={() => {
          setDraft(applied);
          setOpen((o) => !o);
        }}
      >
        Depots: {applied.length === DEPOTS.length ? "all" : applied.length}
      </Button>
      <Popover open={open} onOpenChange={setOpen} anchorRef={anchor} role="dialog" ariaLabel="Filter by depot" restoreFocus width={260}>
        <Stack
          gap={3}
          style={{
            padding: "var(--u-space-4)",
            background: "var(--u-color-surface)",
            borderRadius: "var(--u-radius-md)",
            boxShadow: "var(--u-shadow-overlay)",
          }}
        >
          {DEPOTS.map((depot) => (
            <Checkbox key={depot} label={depot} checked={draft.includes(depot)} onChange={() => toggle(depot)} />
          ))}
          <Stack direction="row" gap={2} justify="flex-end">
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setApplied(draft);
                setOpen(false);
              }}
            >
              Apply
            </Button>
          </Stack>
        </Stack>
      </Popover>
      <Stack gap={1}>
        {SHIPMENTS.filter((s) => applied.includes(s.depot)).map((s) => (
          <Text key={s.id} size="sm">
            {s.id} · {s.customer} · {s.depot}
          </Text>
        ))}
      </Stack>
    </Stack>
  );
}
