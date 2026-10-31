import { useForm, useStore } from "@tanstack/react-form";
import { Button, FormField, Input } from "@umriss-ui/core";
import { NAMES, Row, defaults, schema, refs, log, type Name } from "./shared";

const msg = (e: any) => (typeof e === "string" ? e : e?.message ?? String(e));
const mode = (location.hash.split("?")[1] ?? "onSubmit");
export function TanStack() {
  const form = useForm({
    defaultValues: { ...defaults, emails: ["a@b.c"] as string[] },
    validators: { [mode]: schema } as any,
    onSubmit: async ({ value }) => { await new Promise((r) => setTimeout(r, 400)); (window as any).__submitted = value; },
    onSubmitInvalid: ({ formApi }) => {
      const first = NAMES.find((n) => formApi.getFieldMeta(n as any)?.errors?.length);
      log.push({ firstInvalid: first });
      setTimeout(() => (refs.get(first as string) as any)?.focus?.(), 0);
    },
  });
  const submitting = useStore(form.store, (s) => s.isSubmitting);
  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} style={{ display: "grid", gap: 12, maxWidth: 520, padding: 16 }}>
      {NAMES.map((n) => (
        <form.Field key={n} name={n as any}
          validators={n === "text" ? { onChangeAsync: async ({ value }: any) => { await new Promise((r) => setTimeout(r, 200)); return value === "taken" ? "text: taken (async)" : undefined; }, onBlur: ({ value }: any) => (value === "blur" ? "text: bad on blur" : undefined) } : undefined}>
          {(field: any) => (
            <Row n={n as Name} b={{
              value: field.state.value, onChange: field.handleChange, onBlur: field.handleBlur, disabled: submitting,
              error: field.state.meta.isTouched && field.state.meta.errors.length ? field.state.meta.errors.map(msg).join("; ") : undefined,
            }} />
          )}
        </form.Field>
      ))}
      <form.Field name="emails" mode="array">
        {(arr) => (
          <div data-field="emails">
            {arr.state.value.map((_, i) => (
              <form.Field key={i} name={`emails[${i}]`} validators={{ onChange: ({ value }) => (value.includes("@") ? undefined : "emails: need @") }}>
                {(f) => (
                  <FormField label={`email ${i}`} error={f.state.meta.isTouched && f.state.meta.errors.length ? f.state.meta.errors.map(msg).join() : undefined}>
                    <Input value={f.state.value} onBlur={f.handleBlur} onChange={(e) => f.handleChange(e.target.value)} />
                    <Button type="button" onClick={() => arr.removeValue(i)}>remove</Button>
                  </FormField>
                )}
              </form.Field>
            ))}
            <Button type="button" onClick={() => arr.pushValue("")}>add email</Button>
          </div>
        )}
      </form.Field>
      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (<><Button type="submit" disabled={!canSubmit || isSubmitting}>{isSubmitting ? "..." : "Submit"}</Button><Button type="button" onClick={() => form.reset()}>Reset</Button></>)}
      </form.Subscribe>
      <pre id="state">{""}</pre>
    </form>
  );
}
