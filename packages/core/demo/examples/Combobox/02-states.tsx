import { Combobox, FormField, Grid } from "../../../src";

export const title = "States";
export const lead = "Set `emptyText` for a search that finds nothing; errors come from the `FormField`, and a `disabled` row stays in the list.";

const VEHICLES = [
  { value: "v1", label: "FP 214 K, van, North depot" },
  { value: "v2", label: "FP 377 K, e-van, North depot" },
  { value: "v3", label: "FP 118 R, truck, North depot, in the workshop until Thursday", disabled: true },
  { value: "v4", label: "FP 402 R, van, Riverside depot" },
];

export default function States() {
  return (
    <Grid minItemWidth="240px" gap={4}>
      <FormField label="Vehicle" hint="Type “zz” to see the empty result.">
        <Combobox value={null} onChange={() => {}} options={VEHICLES} emptyText="No vehicle matches. Check the plate." />
      </FormField>
      <FormField label="Vehicle" error="Tour T-04 needs a vehicle before it can be released.">
        <Combobox value={null} onChange={() => {}} options={VEHICLES} placeholder="Choose a vehicle" />
      </FormField>
      <FormField label="Vehicle" hint="The tour is on the road.">
        <Combobox value="v2" onChange={() => {}} options={VEHICLES} disabled />
      </FormField>
      <FormField label="Vehicle" hint="A long label is cut at the field's edge.">
        <Combobox value="v3" onChange={() => {}} options={VEHICLES} />
      </FormField>
    </Grid>
  );
}
