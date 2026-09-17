import { useState } from "react";
import { Button, Stack, Tag, TagGroup } from "../../../src";

export const title = "Removable, in a group";

/* `onRemove` turns the label into a control. Inside a `TagGroup` the arrow keys
   travel across the labels, and after a removal focus stands on the next one -
   not at the top of the page.

   A disabled label keeps its place and loses its button: disabled is a
   statement about the button, not about the label. */

const INITIAL = [
  { id: "backend", label: "Backend" },
  { id: "frontend", label: "Frontend" },
  { id: "design", label: "Design" },
  { id: "critical", label: "Critical" },
];

export default function Removable() {
  const [tags, setTags] = useState(INITIAL);

  return (
    <Stack gap={3} align="flex-start">
      <TagGroup aria-label="Chosen areas">
        {tags.map((tag) => (
          <Tag
            key={tag.id}
            tone="accent"
            onRemove={() => setTags((current) => current.filter((t) => t.id !== tag.id))}
          >
            {tag.label}
          </Tag>
        ))}
        <Tag disabled onRemove={() => {}}>
          Disabled
        </Tag>
      </TagGroup>
      {tags.length < INITIAL.length && (
        <Button size="sm" onClick={() => setTags(INITIAL)}>
          Reset
        </Button>
      )}
    </Stack>
  );
}
