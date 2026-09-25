import { FormField, Slider } from "../../../src";

export const title = "Slider";
export const lead = "Use a slider for a value set roughly between two bounds; `step` sets how finely it moves.";

export default function CanaryTraffic() {
  return (
    <FormField label="Canary traffic, %" hint="Share of requests the new release receives." style={{ maxWidth: 360 }}>
      <Slider min={0} max={100} step={5} defaultValue={10} />
    </FormField>
  );
}
