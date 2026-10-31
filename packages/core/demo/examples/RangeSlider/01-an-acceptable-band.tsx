import { FormField, RangeSlider } from "../../../src";

export const title = "RangeSlider";
export const lead = "Use a range slider for a lower and an upper end set roughly on one track; the ends never cross.";

export default function AnAcceptableBand() {
  return (
    <FormField label="Acceptable temperature, °C" hint="The alarm fires outside this band." style={{ maxWidth: 360 }}>
      <RangeSlider min={0} max={100} step={5} defaultValue={[20, 70]} />
    </FormField>
  );
}
