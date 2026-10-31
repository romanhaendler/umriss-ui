import { useActionState, useRef, type ReactNode } from "react";
import { useForm, useInputControl, getFormProps, type FieldMetadata } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { z } from "zod";
import { FormField, Input, Textarea, NumberInput, Select, Combobox, MultiSelect, Checkbox, RadioGroup, Switch, Slider, SegmentedControl, DatePicker, DateRangePicker, DateTimePicker, FileInput, Button } from "@umriss-ui/core";
import { opts, log, refs } from "./shared";

const schema = z.object({
  text: z.string().min(3, "text: min 3"), notes: z.string().optional(), qty: z.number({ error: "qty: required" }).min(1, "qty: min 1"),
  color: z.string({ error: "color: required" }), city: z.string({ error: "city: required" }), tags: z.array(z.string()).min(1, "tags: pick one"),
  agree: z.literal(true, { error: "agree: must" }), plan: z.string({ error: "plan: required" }), notify: z.boolean().optional(), volume: z.number().min(10),
  view: z.string({ error: "view: required" }), date: z.date({ error: "date: required" }),
  range: z.object({ from: z.date({ error: "range: required" }), to: z.date({ error: "range: required" }) }),
  when: z.date({ error: "when: required" }), files: z.array(z.instanceof(File)).min(1, "files: pick one"),
});
const rec = (fd: FormData) => [...fd.entries()].map(([k, v]) => [k, v instanceof File ? `File:${v.name}:${v.size}` : v]);

/* glue: hidden input conform can find by name, focus forwards to the real control */
function Hidden({ meta, n, multiple }: { meta: FieldMetadata<any>; n: string; multiple?: boolean }) {
  const common = { name: meta.name, tabIndex: -1, "aria-hidden": true, style: { position: "absolute", opacity: 0, width: 1, height: 1, pointerEvents: "none" } as const, onFocus: () => (refs.get(n) as any)?.focus() };
  return multiple ? <select {...common} multiple defaultValue={meta.initialValue as any}>{opts.map((o) => <option key={o.value} value={o.value} />)}</select> : <input {...common} defaultValue={meta.initialValue as any} />;
}
function Wrap({ n, meta, children }: { n: string; meta: FieldMetadata<any>; children: ReactNode }) {
  return <FormField label={n} hint={"hint " + n} error={meta.errors?.[0]} data-field={n}>{children}</FormField>;
}
const blurLog = (n: string, e: any, f: () => void) => { log.push({ blur: n, target: e?.target?.tagName }); f(); };
const reg = (n: string) => (el: any) => { if (el) refs.set(n, el); else refs.delete(n); };

function Glued({ n, meta, kind }: { n: string; meta: FieldMetadata<any>; kind: "qty" | "city" | "tags" | "date" | "when" }) {
  const c = useInputControl(meta as any);
  const common = { ref: reg(n), invalid: !!meta.errors, onBlur: (e: any) => blurLog(n, e, c.blur) } as any;
  let el: ReactNode;
  if (kind === "qty") el = <NumberInput {...common} value={c.value === undefined || c.value === "" ? null : Number(c.value)} onChange={(v) => c.change(v === null ? "" : String(v))} />;
  if (kind === "city") el = <Combobox {...common} options={opts} value={(c.value as string) || null} onChange={(v) => c.change(v ?? "")} />;
  if (kind === "tags") el = <MultiSelect {...common} options={opts} value={(c.value as string[]) ?? []} onChange={(v) => c.change(v)} />;
  if (kind === "date") el = <DatePicker {...common} value={c.value ? new Date(c.value as string) : null} onChange={(v) => c.change(v ? v.toISOString() : "")} />;
  if (kind === "when") el = <DateTimePicker {...common} value={c.value ? new Date(c.value as string) : null} onChange={(v) => c.change(v ? v.toISOString() : "")} />;
  return <Wrap n={n} meta={meta}><Hidden meta={meta} n={n} multiple={kind === "tags"} />{el}</Wrap>;
}
function Range({ meta }: { meta: FieldMetadata<any> }) {
  const f = (meta as any).getFieldset();
  const a = useInputControl(f.from), b = useInputControl(f.to);
  const v = a.value && b.value ? { from: new Date(a.value as string), to: new Date(b.value as string) } : null;
  return (
    <Wrap n="range" meta={f.from.errors ? f.from : meta}>
      <Hidden meta={f.from} n="range" /><Hidden meta={f.to} n="range" />
      <DateRangePicker ref={reg("range")} invalid={!!(f.from.errors || meta.errors)} onBlur={(e) => blurLog("range", e, () => { a.blur(); b.blur(); })} value={v} onChange={(r) => { a.change(r ? r.from.toISOString() : ""); b.change(r ? r.to.toISOString() : ""); }} />
    </Wrap>
  );
}
export function ConformGlue() {
  const [lastResult, action, pending] = useActionState(async (_: unknown, fd: FormData) => {
    (window as any).__fd = rec(fd);
    const sub = parseWithZod(fd, { schema });
    (window as any).__parsed = sub.status === "success" ? JSON.stringify(sub.value) : JSON.stringify(sub.error);
    await new Promise((r) => setTimeout(r, 400));
    return sub.reply();
  }, undefined);
  const [form, f] = useForm({ lastResult, onValidate: ({ formData }) => parseWithZod(formData, { schema }), shouldValidate: "onBlur", shouldRevalidate: "onInput",
    defaultValue: { volume: "30" } });
  const d = pending;
  const nat = (n: keyof typeof f) => ({ name: (f[n] as any).name, ref: reg(n as string), invalid: !!(f[n] as any).errors, disabled: d, onBlur: (e: any) => blurLog(n as string, e, () => {}) }) as any;
  return (
    <form {...getFormProps(form)} action={action} noValidate style={{ display: "grid", gap: 12, maxWidth: 520, padding: 16 }}>
      <Wrap n="text" meta={f.text}><Input {...nat("text")} defaultValue={f.text.initialValue} /></Wrap>
      <Wrap n="notes" meta={f.notes}><Textarea {...nat("notes")} defaultValue={f.notes.initialValue} /></Wrap>
      <Glued n="qty" meta={f.qty} kind="qty" />
      <Wrap n="color" meta={f.color}><Select {...nat("color")} defaultValue=""><option value="">-</option>{opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select></Wrap>
      <Glued n="city" meta={f.city} kind="city" />
      <Glued n="tags" meta={f.tags} kind="tags" />
      <Wrap n="agree" meta={f.agree}><Checkbox name={f.agree.name} ref={reg("agree")} disabled={d} label="I agree" onBlur={(e) => blurLog("agree", e, () => {})} /></Wrap>
      <Wrap n="plan" meta={f.plan}><RadioGroup name={f.plan.name} ref={reg("plan")} disabled={d} options={opts} defaultValue={null} /></Wrap>
      <Wrap n="notify" meta={f.notify}><Switch name={f.notify.name} ref={reg("notify")} disabled={d} label="Notify" /></Wrap>
      <Wrap n="volume" meta={f.volume}><Slider name={f.volume.name} ref={reg("volume")} disabled={d} defaultValue={30} /></Wrap>
      <Wrap n="view" meta={f.view}><SegmentedControl name={f.view.name} ref={reg("view")} disabled={d} options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} defaultValue={null} /></Wrap>
      <Glued n="date" meta={f.date} kind="date" />
      <Range meta={f.range} />
      <Glued n="when" meta={f.when} kind="when" />
      <Wrap n="files" meta={f.files}><FileInput name={f.files.name} ref={reg("files")} disabled={d} /></Wrap>
      <Button type="submit" disabled={d}>Submit</Button>
      <Button type="reset" onClick={() => form.reset()}>Reset</Button>
    </form>
  );
}
