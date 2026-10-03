/* A configurator: the component, a control per value prop, and the code of
   what stands on the stage (.scratch/configurator).

   It takes the first example's slot. What it may control, the values and the
   defaults come from the props table (`tooling/configurator.ts`); here they
   only become umriss's own controls - the panel shows the library at work.

   The code is the import line and one element, every prop at its default left
   out, and the stage renders exactly that: a prop at its default is not
   passed, so a size "md (default)" is whatever a provider around it says, as
   it would be in the reader's own code. Nothing is kept: no storage, no
   address, and a new page starts at the defaults. */

import { useState } from "react";
import { Button, FormField, Input, NumberInput, RadioGroup, Select, Switch } from "@umriss-ui/core";
import { CodeBlock } from "./Example";
import { codeOf, startOf, type Configurator as ConfiguratorData, type Control, type Value } from "./tooling/configurator";

function Field({ control, value, onChange }: { control: Control; value: Value; onChange: (value: Value) => void }) {
  const { prop, kind } = control;
  if (kind === "switch") {
    return <Switch label={prop} checked={value === true} onChange={(event) => onChange(event.target.checked)} />;
  }
  const values = control.values ?? [];
  /* A union's members are strings to the controls; the code takes them back
     as they are written. */
  const back = (text: string) => values.find((one) => String(one) === text) ?? text;
  const label = (one: string | number) => (control.inherited && one === control.defaultValue ? `${one} (default)` : String(one));
  return (
    <FormField label={prop}>
      {kind === "choice" ? (
        <RadioGroup
          aria-label={prop}
          orientation="horizontal"
          value={String(value)}
          onChange={(text) => onChange(back(text))}
          options={values.map((one) => ({ value: String(one), label: label(one) }))}
        />
      ) : kind === "select" ? (
        <Select value={String(value)} onChange={(event) => onChange(back(event.target.value))}>
          {values.map((one) => (
            <option key={one} value={String(one)}>
              {label(one)}
            </option>
          ))}
        </Select>
      ) : kind === "number" ? (
        <NumberInput
          value={typeof value === "number" ? value : null}
          onChange={onChange}
          min={control.min}
          max={control.max}
          step={control.step}
          decimals={control.decimals}
        />
      ) : (
        <Input value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} />
      )}
    </FormField>
  );
}

export function Configurator({ configurator, packageName }: { configurator: ConfiguratorData; packageName: string }) {
  const { name, Component, controls, required } = configurator;
  const [values, setValues] = useState(() => startOf(controls));

  const props: Record<string, unknown> = Object.fromEntries(
    Object.entries(required).map(([prop, value]) => [prop, typeof value === "object" && value !== null ? value.node : value]),
  );
  for (const { prop, defaultValue } of controls) {
    const shown = prop === "children" || prop in required || values[prop] !== defaultValue;
    if (shown && values[prop] !== null) props[prop] = values[prop];
  }

  return (
    <section className="configurator" data-configurator={configurator.pageId} aria-label={`${name}, configured`}>
      <div className="exampleStage configuratorStage">
        <Component {...props} />
      </div>
      <div className="configuratorPanel">
        {controls.map((control) => (
          <Field
            key={control.prop}
            control={control}
            value={values[control.prop] ?? null}
            onChange={(value) => setValues((before) => ({ ...before, [control.prop]: value }))}
          />
        ))}
        <Button className="configuratorReset" variant="ghost" size="sm" onClick={() => setValues(startOf(controls))}>
          Reset
        </Button>
      </div>
      <div className="configuratorCode">
        <CodeBlock name={name} source={codeOf(name, packageName, controls, values, required)} />
      </div>
    </section>
  );
}
