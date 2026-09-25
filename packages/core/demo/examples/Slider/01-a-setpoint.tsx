import { FormField, Slider } from "../../../src";

export const title = "A setpoint, roughly set";

/* The first step: a value between two bounds, the state kept by the slider,
   the figure beside it in mono. The arrows move by one step, PageUp and
   PageDown by a tenth of the range, Home and End to the bounds - on every
   engine alike, because the keys are the component's own.

   A slider is for "about here". Where the exact figure matters, the number
   field is the control: nobody drags to 1,437. */
export default function ASetpoint() {
  return (
    <FormField label="Hall temperature" hint="Between 14 and 26 °C." style={{ maxWidth: 360 }}>
      <Slider min={14} max={26} step={0.5} defaultValue={19.5} showValue />
    </FormField>
  );
}
