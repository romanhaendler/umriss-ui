import { Card, CardBody, FormField, SegmentedControl } from "../../../src";

export const title = "A theme switch";
export const lead =
  "A choice that stands on its own, in a menu or a settings panel, drawn `inset`: a sunken track, the choice lifted out of it. `fill` takes the panel's width and shares it equally between the segments; an option's `icon` stands before its word, at the size the control gives it.";

/* Icons from outside the set: any SVG, sized by the control. */
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function Sun() {
  return (
    <svg viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function Moon() {
  return (
    <svg viewBox="0 0 24 24" {...stroke}>
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
    </svg>
  );
}

function Monitor() {
  return (
    <svg viewBox="0 0 24 24" {...stroke}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

export default function ThemeSwitch() {
  return (
    <Card style={{ maxWidth: 320 }}>
      <CardBody>
        <FormField label="Theme">
          <SegmentedControl
            variant="inset"
            fill
            defaultValue="system"
            options={[
              { value: "light", label: "Light", icon: <Sun /> },
              { value: "dark", label: "Dark", icon: <Moon /> },
              { value: "system", label: "System", icon: <Monitor /> },
            ]}
          />
        </FormField>
      </CardBody>
    </Card>
  );
}
