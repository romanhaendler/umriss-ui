import { useState } from "react";
import { FormField, MultiSelect } from "../../../src";

export const title = "With an error";
export const lead = "Set `invalid` while your check fails and give its reason to the `FormField` as `error`: the field turns red and reads the reason out.";

const SKILLS = [
  { value: "react", label: "React" },
  { value: "ios", label: "iOS" },
  { value: "android", label: "Android" },
  { value: "design", label: "Interaction design" },
];

export default function WithAnError() {
  const [skills, setSkills] = useState<string[]>([]);
  const error = skills.length === 0 ? "Choose at least one skill for the sprint." : undefined;

  return (
    <FormField label="Skills" error={error} style={{ maxWidth: 360 }}>
      <MultiSelect
        value={skills}
        onChange={setSkills}
        options={SKILLS}
        placeholder="Choose skills"
        invalid={error !== undefined}
      />
    </FormField>
  );
}
