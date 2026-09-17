import { Combobox, FormField, Grid } from "../../../src";

export const title = "States";

/* Invalid, disabled, and the case `emptyText` exists for: a term that finds
   nothing. Without it an empty surface stands there, and an empty surface
   looks like a defect. */

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma", disabled: true },
];

export default function States() {
  return (
    <Grid minItemWidth="240px" gap={4}>
      <FormField label="With a disabled row">
        <Combobox value={null} onChange={() => {}} options={OPTIONS} placeholder="Choose ..." />
      </FormField>
      <FormField label="Invalid" error="Please name a person.">
        <Combobox value={null} onChange={() => {}} options={OPTIONS} />
      </FormField>
      <FormField label="Disabled" hint="Deactivated.">
        <Combobox value="a" onChange={() => {}} options={OPTIONS} disabled />
      </FormField>
      <FormField label="Empty result" hint={'Search for "zzz".'}>
        <Combobox
          value={null}
          onChange={() => {}}
          options={OPTIONS}
          emptyText="Nothing found - perhaps a different spelling?"
        />
      </FormField>
    </Grid>
  );
}
