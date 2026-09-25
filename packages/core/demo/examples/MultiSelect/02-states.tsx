import { FormField, Grid, MultiSelect } from "../../../src";

export const title = "States";
export const lead = "Errors come from the `FormField`; `disabled` locks the field but keeps what is chosen visible, even on a `disabled` row.";

const SKILLS = [
  { value: "react", label: "React" },
  { value: "ios", label: "iOS" },
  { value: "android", label: "Android" },
  { value: "design", label: "Interaction design" },
  { value: "a11y", label: "Accessibility audits" },
  { value: "qa", label: "Test automation", disabled: true },
];

export default function States() {
  return (
    <Grid minItemWidth="240px" gap={4}>
      <FormField label="Skills" hint="Nothing chosen yet.">
        <MultiSelect value={[]} onChange={() => {}} options={SKILLS} placeholder="Choose skills" />
      </FormField>
      <FormField label="Skills" error="Choose at least one skill for the sprint.">
        <MultiSelect value={[]} onChange={() => {}} options={SKILLS} placeholder="Choose skills" />
      </FormField>
      <FormField label="Skills" hint="Set by the team lead.">
        <MultiSelect value={["react", "qa"]} onChange={() => {}} options={SKILLS} disabled />
      </FormField>
      <FormField label="Skills" hint="More than fits: the rest as +N.">
        <MultiSelect value={["react", "ios", "android", "design", "a11y"]} onChange={() => {}} options={SKILLS} />
      </FormField>
    </Grid>
  );
}
