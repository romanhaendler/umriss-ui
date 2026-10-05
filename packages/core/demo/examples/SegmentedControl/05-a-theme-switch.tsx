import { Card, CardBody, FormField, SegmentedControl } from "../../../src";

export const title = "A theme switch";
export const lead =
  "A choice that stands on its own, in a menu or a settings panel. `fill` takes the panel's width and shares it equally between the segments.";

export default function ThemeSwitch() {
  return (
    <Card style={{ maxWidth: 320 }}>
      <CardBody>
        <FormField label="Theme">
          <SegmentedControl
            fill
            defaultValue="system"
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ]}
          />
        </FormField>
      </CardBody>
    </Card>
  );
}
