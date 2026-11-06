import { ColorPicker, FormField, Grid } from "../../../src";

export const title = "Contrast against your surfaces";
export const lead = "The panel reads the colour against core's light and dark surface and says Pass or Fail at 3:1 - the bound for a line or a mark, not for text. `contrastAgainst` names your own surfaces instead; an empty list hides the readout.";

/* The two values of core's `--u-color-surface` token (light, dark). */
const LIGHT = "#ffffff";
const DARK = "#161618";

const SURFACES = [
  { name: "Plan", value: "#f4f1ea" },
  { name: "Night plan", value: "#1c2430" },
  { name: "Map", value: "#cfe3d4" },
];

export default function ContrastAgainstYourSurfaces() {
  return (
    <Grid minItemWidth="260px" gap={4}>
      <FormField label="Core's surfaces" hint="The default: light and dark.">
        <ColorPicker defaultValue="#7c9cff" contrastAgainst={[{ name: "Light", value: LIGHT }, { name: "Dark", value: DARK }]} />
      </FormField>
      <FormField label="Your surfaces" hint="Three backgrounds the line must stay visible on.">
        <ColorPicker defaultValue="#d97706" contrastAgainst={SURFACES} />
      </FormField>
      <FormField label="No readout" hint="An empty list.">
        <ColorPicker defaultValue="#475569" contrastAgainst={[]} />
      </FormField>
    </Grid>
  );
}
