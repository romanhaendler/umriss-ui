import { useForm, Controller } from "react-hook-form";
import { Button } from "@umriss-ui/core";
import { NAMES, Row, defaults, schema, log } from "./shared";

const undef = location.hash.includes("undef");
export function RHF() {
  const { control, handleSubmit, reset, formState } = useForm<any>({
    mode: location.hash.includes("onBlur") ? "onBlur" : "onSubmit",
    defaultValues: undef ? (({ city, ...r }) => r)(defaults) : defaults,
    resolver: async (values) => {
      const r = schema.safeParse(values);
      if (r.success) return { values: r.data, errors: {} };
      const errors: any = {};
      for (const i of r.error.issues) errors[i.path[0] as string] ??= { type: "zod", message: i.message };
      return { values: {}, errors };
    },
  });
  const submit = handleSubmit(async (v) => { await new Promise((r) => setTimeout(r, 400)); (window as any).__submitted = v; }, (e) => log.push({ invalid: Object.keys(e) }));
  return (
    <form noValidate onSubmit={submit} style={{ display: "grid", gap: 12, maxWidth: 520, padding: 16 }}>
      {NAMES.map((n) => (
        <Controller key={n} name={n} control={control} render={({ field, fieldState }) => (
          <Row n={n} b={{ value: field.value, onChange: field.onChange, onBlur: field.onBlur, ref: field.ref, error: fieldState.error?.message, disabled: formState.isSubmitting }} />
        )} />
      ))}
      <Button type="submit" disabled={formState.isSubmitting}>Submit</Button>
      <Button type="button" onClick={() => reset()}>Reset</Button>
      <i id="touched">{Object.keys(formState.touchedFields).join(",")}</i>
    </form>
  );
}
