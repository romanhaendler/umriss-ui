import { useEffect, useMemo, useState } from "react";
import {
  Alert, Badge, Breadcrumb, Button, Card, CardBody, CardHeader, Checkbox, Combobox, CommandPalette, ConfirmDialog, DatePicker,
  Divider, Drawer, EmptyState, FileInput, FormField, Grid, Heading, IconButton, Input, LanguageProvider, Menu, MenuItem,
  MenuSeparator, Modal, ModalBody, ModalFooter, ModalHeader, MoreGlyph, MultiSelect, NumberInput, ProgressBar, RadioGroup,
  Select, Skeleton, Slider, Stack, Stepper, Switch, Tab, TabList, TabPanel, Tabs, Tag, TagGroup, Text, Textarea, ToastProvider,
  UmrissProvider, useToast, useTree, useLanguage,
} from "@umriss-ui/core";
import { GERMAN_WORDING, GERMAN_FORMATS } from "@umriss-ui/core/wording/de";
import { Pagination, Search, Toolbar, useTable } from "@umriss-ui/table";

const ROUTES = ["login", "settings", "form", "wizard", "notifications", "upload", "profile", "search", "admin"] as const;
type Route = (typeof ROUTES)[number];
const useRoute = (): [Route, (r: Route) => void] => {
  const read = () => (ROUTES.find((r) => location.hash === `#/${r}`) ?? "login") as Route;
  const [r, set] = useState<Route>(read);
  useEffect(() => { const f = () => set(read()); addEventListener("hashchange", f); return () => removeEventListener("hashchange", f); }, []);
  return [r, (x) => { location.hash = `/${x}`; }];
};

/* 1 login */
function Login() {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);
  const { toast } = useToast();
  const emailErr = email && !email.includes("@") ? "Not an email address" : undefined;
  return (
    <Card style={{ maxWidth: 400, margin: "0 auto" }}>
      <CardHeader title="Sign in" />
      <CardBody>
        <form onSubmit={(e) => { e.preventDefault(); setBusy(true); setErr(null); setTimeout(() => { setBusy(false); if (pw !== "secret") setErr("Wrong password"); else toast({ title: "Welcome", tone: "success" }); }, 800); }}>
          <Stack gap={3}>
            {err && <Alert tone="danger" title={err} onDismiss={() => setErr(null)} />}
            <FormField label="Email" required error={emailErr}><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></FormField>
            <Stack direction="row" gap={2} align="flex-end">
              <FormField label="Password" required style={{ flex: 1 }}><Input type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} /></FormField>
              <Button type="button" aria-pressed={show} onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</Button>
            </Stack>
            <Checkbox label="Remember me" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <Button type="submit" variant="primary" loading={busy}>Sign in</Button>
          </Stack>
        </form>
      </CardBody>
    </Card>
  );
}

/* 2 settings */
function Settings({ dark, setDark, de, setDe }: { dark: boolean; setDark: (b: boolean) => void; de: boolean; setDe: (b: boolean) => void }) {
  const [vol, setVol] = useState(40); const [density, setDensity] = useState<"compact" | "comfortable">("comfortable");
  const [notif, setNotif] = useState({ mail: true, push: false, sms: false });
  return (
    <Stack gap={4} style={{ maxWidth: 560 }}>
      <Tabs defaultValue="general">
        <TabList aria-label="Settings"><Tab value="general">General</Tab><Tab value="notif">Notifications</Tab><Tab value="danger">Account</Tab></TabList>
        <TabPanel value="general">
          <Stack gap={3}>
            <Switch label="Dark mode" checked={dark} onChange={(e) => setDark(e.target.checked)} />
            <Switch label="Deutsch" checked={de} onChange={(e) => setDe(e.target.checked)} />
            <FormField label="Volume"><Slider value={vol} onChange={setVol} /></FormField>
            <FormField label="Density"><RadioGroup value={density} onChange={setDensity} orientation="horizontal" options={[{ value: "compact", label: "Compact" }, { value: "comfortable", label: "Comfortable" }]} /></FormField>
          </Stack>
        </TabPanel>
        <TabPanel value="notif">
          <Stack gap={2}>{(["mail", "push", "sms"] as const).map((k) => <Switch key={k} label={k} checked={notif[k]} onChange={(e) => setNotif({ ...notif, [k]: e.target.checked })} />)}</Stack>
        </TabPanel>
        <TabPanel value="danger"><Button variant="danger">Delete account</Button></TabPanel>
      </Tabs>
    </Stack>
  );
}

/* 3 15-field form */
const COUNTRIES = ["Germany", "Switzerland", "Austria", "France", "Italy"].map((c) => ({ value: c, label: c }));
function BigForm() {
  const [v, setV] = useState<Record<string, any>>({ tags: ["a"], langs: [], age: null, country: null, dob: null, salary: null });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const set = (k: string, x: any) => setV((p) => ({ ...p, [k]: x }));
  const { toast } = useToast();
  const submit = () => {
    const e: Record<string, string> = {};
    for (const k of ["first", "last", "email", "country", "dob", "terms"]) if (!v[k]) e[k] = `${k} is required`;
    setErrs(e);
    if (!Object.keys(e).length) toast({ title: "Saved", tone: "success" });
  };
  const f = (k: string, label: string, el: React.ReactNode, required = false) => <FormField key={k} label={label} required={required} error={errs[k]}>{el}</FormField>;
  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); submit(); }}>
      {Object.keys(errs).length > 0 && <Alert tone="danger" title={`${Object.keys(errs).length} problems`}><ul>{Object.entries(errs).map(([k, m]) => <li key={k}><a href={`#f-${k}`} onClick={(e) => { e.preventDefault(); (document.querySelector(`[name=${k}]`) as HTMLElement | null)?.focus(); }}>{m}</a></li>)}</ul></Alert>}
      <Grid minItemWidth="240px" gap={3}>
        {f("first", "First name", <Input name="first" value={v.first ?? ""} onChange={(e) => set("first", e.target.value)} />, true)}
        {f("last", "Last name", <Input name="last" value={v.last ?? ""} onChange={(e) => set("last", e.target.value)} />, true)}
        {f("email", "Email", <Input name="email" type="email" value={v.email ?? ""} onChange={(e) => set("email", e.target.value)} />, true)}
        {f("phone", "Phone", <Input name="phone" type="tel" clearable value={v.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />)}
        {f("country", "Country", <Combobox options={COUNTRIES} value={v.country} onChange={(x) => set("country", x)} clearable />, true)}
        {f("dob", "Date of birth", <DatePicker value={v.dob} onChange={(x) => set("dob", x)} clearable />, true)}
        {f("age", "Age", <NumberInput value={v.age} onChange={(x) => set("age", x)} min={0} max={130} />)}
        {f("salary", "Salary", <NumberInput value={v.salary} onChange={(x) => set("salary", x)} decimals={2} suffix="€" />)}
        {f("role", "Role", <Select name="role" value={v.role ?? ""} onChange={(e) => set("role", e.target.value)}><option value="">Choose</option><option>Admin</option><option>Editor</option></Select>)}
        {f("langs", "Languages", <MultiSelect options={["EN", "DE", "FR"].map((x) => ({ value: x, label: x }))} value={v.langs} onChange={(x) => set("langs", x)} />)}
        {f("bio", "Bio", <Textarea name="bio" autoGrow showCount maxLength={200} value={v.bio ?? ""} onChange={(e) => set("bio", e.target.value)} />)}
        {f("plan", "Plan", <RadioGroup value={v.plan ?? null} onChange={(x) => set("plan", x)} options={[{ value: "free", label: "Free" }, { value: "pro", label: "Pro" }]} />)}
        {f("news", "Newsletter", <Switch label="Subscribe" checked={!!v.news} onChange={(e) => set("news", e.target.checked)} />)}
        {f("vol", "Volume", <Slider value={v.vol ?? 10} onChange={(x) => set("vol", x)} />)}
        {f("terms", "Terms", <Checkbox name="terms" label="I accept the terms" checked={!!v.terms} onChange={(e) => set("terms", e.target.checked)} />, true)}
      </Grid>
      <Stack direction="row" gap={2} style={{ marginTop: 16 }}><Button type="submit" variant="primary">Save</Button><Button type="reset" onClick={() => { setV({ tags: [], langs: [], country: null, dob: null, age: null, salary: null }); setErrs({}); }}>Reset</Button></Stack>
    </form>
  );
}

/* 4 wizard */
function Wizard() {
  const [step, setStep] = useState(0); const [name, setName] = useState(""); const [plan, setPlan] = useState<string | null>(null); const [ok, setOk] = useState(false);
  const steps = [{ label: "Account" }, { label: "Plan" }, { label: "Confirm" }];
  const canNext = step === 0 ? name.length > 1 : step === 1 ? !!plan : true;
  return (
    <Stack gap={4} style={{ maxWidth: 560 }}>
      <Stepper steps={steps} current={step} />
      {step === 0 && <FormField label="Company" required><Input autoFocus value={name} onChange={(e) => setName(e.target.value)} /></FormField>}
      {step === 1 && <FormField label="Plan" required><RadioGroup value={plan} onChange={setPlan} options={[{ value: "s", label: "Small" }, { value: "l", label: "Large" }]} /></FormField>}
      {step === 2 && <Text>Create {name} on plan {plan}?</Text>}
      <Stack direction="row" gap={2}>
        <Button disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
        {step < 2 ? <Button variant="primary" disabled={!canNext} onClick={() => setStep(step + 1)}>Next</Button> : <Button variant="primary" onClick={() => setOk(true)}>Create</Button>}
      </Stack>
      <ConfirmDialog open={ok} title="Done" description="Account created" onClose={() => setOk(false)} onConfirm={() => { setOk(false); setStep(0); }} />
    </Stack>
  );
}

/* 5 notifications */
function Notifications() {
  const { toast, update, dismiss } = useToast();
  const [items, setItems] = useState([1, 2, 3, 4].map((i) => ({ id: i, text: `Message ${i}`, read: i > 2 })));
  return (
    <Stack gap={3} style={{ maxWidth: 560 }}>
      <Stack direction="row" gap={2} wrap>
        {(["success", "danger", "warning", "neutral"] as const).map((t) => <Button key={t} onClick={() => toast({ title: `A ${t} toast`, description: "with text", tone: t })}>{t}</Button>)}
        <Button onClick={() => { const id = toast({ title: "Working", tone: "loading" }); setTimeout(() => update(id, { title: "Done", tone: "success", duration: 3000 }), 1500); }}>loading</Button>
        <Button onClick={() => { const id = toast({ title: "Undo?", duration: 0, action: { label: "Undo", onClick: () => dismiss(id) } }); }}>sticky + action</Button>
        <Button onClick={() => { for (let i = 0; i < 8; i++) toast({ title: `Burst ${i}` }); }}>burst 8</Button>
      </Stack>
      <Stack gap={1}>{items.map((m) => (
        <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, borderBottom: "1px solid var(--u-border, #ddd)" }}>
          {!m.read && <Badge tone="accent" pill>new</Badge>}<Text style={{ flex: 1 }}>{m.text}</Text>
          <Menu align="end" trigger={<IconButton aria-label={`Actions for ${m.text}`}><MoreGlyph /></IconButton>}>
            <MenuItem onSelect={() => setItems(items.map((x) => x.id === m.id ? { ...x, read: true } : x))}>Mark read</MenuItem>
            <MenuSeparator />
            <MenuItem tone="danger" onSelect={() => setItems(items.filter((x) => x.id !== m.id))}>Delete</MenuItem>
          </Menu>
        </div>))}
        {items.length === 0 && <EmptyState title="No notifications" description="You are up to date" />}
      </Stack>
    </Stack>
  );
}

/* 6 upload */
function Upload() {
  const [files, setFiles] = useState<File[]>([]); const [prog, setProg] = useState<Record<string, number>>({});
  const start = () => files.forEach((f) => { let p = 0; const t = setInterval(() => { p = Math.min(1, p + 0.1); setProg((x) => ({ ...x, [f.name]: p })); if (p >= 1) clearInterval(t); }, 150); });
  return (
    <Stack gap={3} style={{ maxWidth: 560 }}>
      <FormField label="Documents" hint="PDF or PNG, up to 5 MB"><FileInput multiple accept=".pdf,.png" value={files} onChange={setFiles} /></FormField>
      {files.map((f) => <div key={f.name}><Text size="sm">{f.name}</Text><ProgressBar value={prog[f.name] ?? 0} aria-label={f.name} /></div>)}
      <Button variant="primary" disabled={!files.length} onClick={start}>Upload</Button>
    </Stack>
  );
}

/* 7 profile */
function Profile() {
  const [edit, setEdit] = useState(false); const [name, setName] = useState("Ada Lovelace"); const [draft, setDraft] = useState(name);
  const [tags, setTags] = useState(["math", "engines", "poetry"]);
  const initials = name.split(" ").map((s) => s[0]).join("");
  return (
    <Card style={{ maxWidth: 520 }}>
      <CardHeader title="Profile" actions={<Button size="sm" onClick={() => { setDraft(name); setEdit(true); }}>Edit</Button>} />
      <CardBody>
        <Stack direction="row" gap={3} align="center">
          <div aria-hidden style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--u-accent, #36c)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 600 }}>{initials}</div>
          <div><Heading level={2} size="md">{name}</Heading><Text tone="secondary">ada@example.com</Text></div>
        </Stack>
        <Divider label="Skills" />
        <TagGroup aria-label="Skills">{tags.map((t) => <Tag key={t} onRemove={() => setTags(tags.filter((x) => x !== t))}>{t}</Tag>)}</TagGroup>
      </CardBody>
      <Modal open={edit} onClose={() => setEdit(false)}>
        <ModalHeader title="Edit name" />
        <ModalBody><FormField label="Name"><Input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} /></FormField></ModalBody>
        <ModalFooter><Button onClick={() => setEdit(false)}>Cancel</Button><Button variant="primary" onClick={() => { setName(draft); setEdit(false); }}>Save</Button></ModalFooter>
      </Modal>
    </Card>
  );
}

/* 8 search */
const WORDS = Array.from({ length: 120 }, (_, i) => `Result ${i + 1} ${["alpha", "beta", "gamma"][i % 3]}`);
function SearchScreen() {
  const [q, setQ] = useState(""); const [page, setPage] = useState(1); const [loading, setLoading] = useState(false);
  const [debounced, setDebounced] = useState("");
  useEffect(() => { setLoading(true); const t = setTimeout(() => { setDebounced(q); setPage(1); setLoading(false); }, 300); return () => clearTimeout(t); }, [q]);
  const hits = useMemo(() => WORDS.filter((w) => w.toLowerCase().includes(debounced.toLowerCase())), [debounced]);
  const pages = Math.max(1, Math.ceil(hits.length / 10));
  return (
    <Stack gap={3} style={{ maxWidth: 560 }}>
      <Input type="search" aria-label="Search" placeholder="Search…" clearable value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ("")} />
      {loading ? <Stack gap={2}>{[1, 2, 3].map((i) => <Skeleton key={i} height={16} />)}</Stack> : hits.length === 0 ? <EmptyState title={`Nothing for "${debounced}"`} /> :
        <ul aria-label="Results">{hits.slice((page - 1) * 10, page * 10).map((h) => <li key={h}>{h}</li>)}</ul>}
      <Stack direction="row" gap={2} align="center"><Button size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button><Text size="sm">{page} / {pages}</Text><Button size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button></Stack>
    </Stack>
  );
}

/* 10 admin: 200 users */
interface User { id: string; name: string; email: string; role: string; active: boolean; created: Date }
const USERS: User[] = Array.from({ length: 200 }, (_, i) => ({ id: `u${i}`, name: `User ${i + 1}`, email: `user${i + 1}@example.com`, role: ["Admin", "Editor", "Viewer"][i % 3], active: i % 4 !== 0, created: new Date(2025, i % 12, 1 + (i % 28)) }));
function Admin() {
  const [rows, setRows] = useState(USERS); const [del, setDel] = useState<User[] | null>(null);
  const t = useTable(rows, { rowKey: (u) => u.id });
  const { Table, Column, RowActions, Action } = t;
  return (
    <div style={{ height: "calc(100vh - 160px)", minHeight: 360 }}>
      <Table selectable aria-label="Users">
        <Toolbar><Search /></Toolbar>
        <Column value="name" label="Name" rowHeader />
        <Column value="email" label="Email" />
        <Column value="role" label="Role" />
        <Column value="created" label="Created" format="date" />
        <Column id="active" label="Active" value={(u) => (u.active ? "Yes" : "No")} />
        <RowActions><Action onSelect={(u) => setDel([u])} tone="danger">Delete</Action><Action bulk tone="danger" onSelect={(l) => setDel(l)}>Delete</Action></RowActions>
        <Pagination pageSizes={[10, 25, 50]} />
      </Table>
      <ConfirmDialog open={!!del} tone="danger" title={`Delete ${del?.length} users?`} confirmLabel="Delete" onClose={() => setDel(null)} onConfirm={() => { const ids = new Set(del!.map((u) => u.id)); setRows(rows.filter((r) => !ids.has(r.id))); setDel(null); }} />
    </div>
  );
}

/* 9 shell */
function Shell() {
  const [route, go] = useRoute();
  const [dark, setDark] = useState(false); const [de, setDe] = useState(false);
  const [nav, setNav] = useState(false); const [pal, setPal] = useState(false);
  useEffect(() => { document.documentElement.style.colorScheme = dark ? "dark" : "light"; }, [dark]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setPal(true); } }; addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, []);
  const items = ROUTES.map((r) => ({ id: r, label: r[0].toUpperCase() + r.slice(1) }));
  const body = { login: <Login />, settings: <Settings dark={dark} setDark={setDark} de={de} setDe={setDe} />, form: <BigForm />, wizard: <Wizard />, notifications: <Notifications />, upload: <Upload />, profile: <Profile />, search: <SearchScreen />, admin: <Admin /> }[route];
  return (
    <UmrissProvider language={de ? { wording: GERMAN_WORDING, formats: GERMAN_FORMATS } : undefined}>
      <ToastProvider>
        <header style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderBottom: "1px solid #8884" }}>
          <Button size="sm" aria-label="Menu" onClick={() => setNav(true)}>☰</Button>
          <Heading level={1} size="md" style={{ flex: 1 }}>p9 app</Heading>
          <Button size="sm" onClick={() => setPal(true)}>Search ⌘K</Button>
          <Switch size="sm" label="Dark" checked={dark} onChange={(e) => setDark(e.target.checked)} />
          <Switch size="sm" label="DE" checked={de} onChange={(e) => setDe(e.target.checked)} />
        </header>
        <main style={{ padding: 16 }}>
          <Breadcrumb items={[{ label: "Home", href: "#/login" }, { label: route }]} />
          <Heading level={2} style={{ margin: "8px 0 16px" }}>{route}</Heading>
          {body}
        </main>
        <Drawer open={nav} side="left" onClose={() => setNav(false)}>
          <ModalHeader title="Navigate" />
          <ModalBody><Stack gap={1}>{items.map((i) => <Button key={i.id} variant={route === i.id ? "primary" : "plain"} onClick={() => { go(i.id as Route); setNav(false); }}>{i.label}</Button>)}</Stack></ModalBody>
        </Drawer>
        <CommandPalette open={pal} onClose={() => setPal(false)} items={items} onChoose={(id) => { go(id as Route); setPal(false); }} />
      </ToastProvider>
    </UmrissProvider>
  );
}
import { Probe } from "./probe";
export function App() { return location.hash === "#/probe" ? <Probe /> : <Shell />; }
