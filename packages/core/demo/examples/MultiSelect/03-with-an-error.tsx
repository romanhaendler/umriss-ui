import { useId, useState } from "react";
import { MultiSelect, Stack, Text } from "../../../src";

export const title = "With an error";
export const lead = "A `FormField` with an `error` marks the field invalid by itself. Without one, set `invalid` and tie your message to the field with `aria-describedby`.";

const SKILLS = [
  { value: "react", label: "React" },
  { value: "ios", label: "iOS" },
  { value: "android", label: "Android" },
  { value: "design", label: "Interaction design" },
];

export default function WithAnError() {
  const [skills, setSkills] = useState<string[]>([]);
  const messageId = useId();
  const error = skills.length === 0 ? "Choose at least one skill for the sprint." : undefined;

  return (
    <Stack gap={1} style={{ maxWidth: 360 }}>
      <MultiSelect
        aria-label="Skills"
        value={skills}
        onChange={setSkills}
        options={SKILLS}
        placeholder="Choose skills"
        invalid={error !== undefined}
        aria-describedby={error ? messageId : undefined}
      />
      {error && (
        <Text id={messageId} size="xs" style={{ color: "var(--u-color-danger-text)" }}>
          {error}
        </Text>
      )}
    </Stack>
  );
}
