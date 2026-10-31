import type { Ref, ReactNode } from "react";
import { FormField, Input, Textarea, NumberInput, Select, Combobox, MultiSelect, Checkbox, RadioGroup, Switch, Slider, SegmentedControl, DatePicker, DateRangePicker, DateTimePicker, FileInput } from "@umriss-ui/core";
import type { DateRange } from "@umriss-ui/core";
import "@umriss-ui/core/styles.css";
import { z } from "zod";

export const opts = [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }, { value: "c", label: "Gamma" }];
export const NAMES = ["text","notes","qty","color","city","tags","agree","plan","notify","volume","view","date","range","when","files"] as const;
export type Name = typeof NAMES[number];
export interface Values { text: string; notes: string; qty: number | null; color: string; city: string | null; tags: string[]; agree: boolean; plan: string | null; notify: boolean; volume: number; view: string | null; date: Date | null; range: DateRange | null; when: Date | null; files: File[] }
export const defaults: Values = { text: "", notes: "", qty: null, color: "", city: null, tags: [], agree: false, plan: null, notify: false, volume: 30, view: null, date: null, range: null, when: null, files: [] };
export const schema = z.object({
  text: z.string().min(3, "text: min 3"), notes: z.string(), qty: z.number({ error: "qty: required" }).min(1, "qty: min 1"),
  color: z.string().min(1, "color: required"), city: z.string({ error: "city: required" }), tags: z.array(z.string()).min(1, "tags: pick one"),
  agree: z.literal(true, { error: "agree: must" }), plan: z.string({ error: "plan: required" }), notify: z.boolean(), volume: z.number().min(10, "volume: min 10"),
  view: z.string({ error: "view: required" }), date: z.date({ error: "date: required" }), range: z.object({ from: z.date(), to: z.date() }, { error: "range: required" }),
  when: z.date({ error: "when: required" }), files: z.array(z.instanceof(File)).min(1, "files: pick one"),
});
export const log: any[] = ((window as any).__log = []);
export const refs = ((window as any).__refs = new Map<string, HTMLElement>());

export interface Bind { value: any; onChange: (v: any) => void; onBlur: (e?: any) => void; error?: ReactNode; ref?: Ref<any>; name?: string; disabled?: boolean }
const hints: Record<Name, string> = {} as any;
/** One field in a FormField; `bind` is the library's glue. onBlur is logged per field name. */
export function Row({ n, b }: { n: Name; b: Bind }) {
  const blur = (e?: any) => { log.push({ blur: n, target: e?.target?.tagName ? e.target.tagName + (e.target.getAttribute?.("role") ? "[" + e.target.getAttribute("role") + "]" : "") : "?" }); b.onBlur(e); };
  const ref = (el: any) => { if (el) refs.set(n, el); else refs.delete(n); if (typeof b.ref === "function") b.ref(el); };
  const noInvalid = ["agree","plan","view","volume"].includes(n);
  const common = { ...(noInvalid ? {} : { invalid: !!b.error }), onBlur: blur, ref, disabled: b.disabled, name: b.name } as any;
  let c: ReactNode;
  switch (n) {
    case "text": c = <Input {...common} value={b.value} onChange={(e) => b.onChange(e.target.value)} />; break;
    case "notes": c = <Textarea {...common} value={b.value} onChange={(e) => b.onChange(e.target.value)} />; break;
    case "qty": c = <NumberInput {...common} value={b.value} onChange={b.onChange} />; break;
    case "color": c = <Select {...common} value={b.value} onChange={(e) => b.onChange(e.target.value)}><option value="">-</option>{opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select>; break;
    case "city": c = <Combobox {...common} options={opts} value={b.value} onChange={b.onChange} />; break;
    case "tags": c = <MultiSelect {...common} options={opts} value={b.value} onChange={b.onChange} />; break;
    case "agree": c = <Checkbox {...common} label="I agree" checked={b.value} onChange={(e) => b.onChange(e.target.checked)} />; break;
    case "plan": c = <RadioGroup {...common} options={opts} value={b.value} onChange={b.onChange} />; break;
    case "notify": c = <Switch {...common} label="Notify" checked={b.value} onChange={(e) => b.onChange(e.target.checked)} />; break;
    case "volume": c = <Slider {...common} value={b.value} onChange={b.onChange} />; break;
    case "view": c = <SegmentedControl {...common} options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} value={b.value} onChange={b.onChange} />; break;
    case "date": c = <DatePicker {...common} value={b.value} onChange={b.onChange} />; break;
    case "range": c = <DateRangePicker {...common} value={b.value} onChange={b.onChange} />; break;
    case "when": c = <DateTimePicker {...common} value={b.value} onChange={b.onChange} />; break;
    case "files": c = <FileInput {...common} value={b.value} onChange={b.onChange} />; break;
  }
  return <FormField label={n} hint={"hint " + n} error={b.error} data-field={n}>{c}</FormField>;
}
