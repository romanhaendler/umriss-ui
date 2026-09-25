import { useState } from "react";
import { Button, Card, CardBody, CardHeader, Stack, Text } from "../../../src";

export const title = "Fold from outside";
export const lead = "Control `collapsed` with `onCollapsedChange` when a toolbar folds every card at once, or an address keeps which stand open.";

const PEOPLE = [
  { id: "arjun", name: "Arjun Mehta", work: "Member portal: sign-in form, 16 h left" },
  { id: "chloe", name: "Chloe Durand", work: "Member portal: profile page, 10 h left" },
  { id: "noah", name: "Noah Fischer", work: "Online shop: search results design, 6 h left" },
];

export default function FoldFromOutside() {
  const [folded, setFolded] = useState<ReadonlySet<string>>(() => new Set(["noah"]));
  const fold = (id: string, collapsed: boolean) =>
    setFolded((previous) => {
      const next = new Set(previous);
      if (collapsed) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <Stack gap={3} style={{ maxWidth: 520 }}>
      <Stack direction="row" gap={2}>
        <Button size="sm" onClick={() => setFolded(new Set())}>
          Open all
        </Button>
        <Button size="sm" onClick={() => setFolded(new Set(PEOPLE.map((p) => p.id)))}>
          Fold all
        </Button>
      </Stack>
      {PEOPLE.map((person) => (
        <Card
          key={person.id}
          collapsible
          collapsed={folded.has(person.id)}
          onCollapsedChange={(collapsed) => fold(person.id, collapsed)}
        >
          <CardHeader eyebrow="Sprint 14" title={person.name} />
          <CardBody>
            <Text size="sm">{person.work}</Text>
          </CardBody>
        </Card>
      ))}
    </Stack>
  );
}
