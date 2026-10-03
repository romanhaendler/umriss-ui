// Audit script: props coverage, opaque types, example usage, export coverage.
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
const ROOT = "/Users/romanhaendler/cc/umriss/packages";
const require = createRequire(join(ROOT, "demo/package.json"));
const ts = require("typescript");

const PKGS = ["core", "charts", "table", "schedule", "calculation"];
const ENTRIES: Record<string, string[]> = {
  core: ["src/index.ts", "src/lib/language/de.ts"],
  charts: ["src/index.ts", "src/wording/de.ts"],
  table: ["src/index.ts"], schedule: ["src/index.ts"], calculation: ["src/index.ts"],
};

function walk(dir: string, re: RegExp): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name), re) : re.test(e.name) ? [join(dir, e.name)] : []);
}

// All declared type names across all packages' src (interface/type/enum/class).
const declared = new Map<string, string>(); // name -> pkg
for (const p of PKGS) for (const f of walk(join(ROOT, p, "src"), /\.tsx?$/)) {
  const sf = ts.createSourceFile(f, readFileSync(f, "utf8"), ts.ScriptTarget.Latest, true);
  sf.statements.forEach((s: any) => {
    if ((ts.isInterfaceDeclaration(s) || ts.isTypeAliasDeclaration(s) || ts.isEnumDeclaration(s) || ts.isClassDeclaration(s)) && s.name)
      if (!declared.has(s.name.text)) declared.set(s.name.text, p);
  });
}

const all: any = {};
const allTables = new Set<string>();
for (const p of PKGS) {
  const props = JSON.parse(readFileSync(join(ROOT, p, "demo/.generated/props.json"), "utf8"));
  for (const k of Object.keys(props)) allTables.add(k);
}
const siteTextAll: Record<string, string> = {};
for (const p of PKGS) {
  const pages = JSON.parse(readFileSync(join(ROOT, p, "demo/.generated/pages.json"), "utf8"));
  siteTextAll[p] = pages.map((x: any) => x.html).join("\n");
}
const siteAll = Object.values(siteTextAll).join("\n");

const BUILTIN = new Set(("ReactNode ReactElement CSSProperties Ref RefObject MutableRefObject Record Partial Readonly ReadonlyArray Array Date Map Set " +
  "Promise Omit Pick Exclude Extract NonNullable Required ReturnType Parameters KeyboardEvent MouseEvent PointerEvent ChangeEvent FocusEvent " +
  "HTMLElement HTMLDivElement HTMLInputElement HTMLButtonElement HTMLTableElement HTMLDialogElement SVGSVGElement Element Intl DateTimeFormatOptions NumberFormatOptions " +
  "React ComponentType JSX Iterable AbortSignal File FileList Blob Error RegExp Function Uint8Array HTMLTextAreaElement HTMLSelectElement HTMLSpanElement HTMLAnchorElement Node Event Dispatch SetStateAction KeyboardEventHandler MouseEventHandler DragEvent WheelEvent ElementType Key ComponentProps HTMLAttributes ButtonHTMLAttributes").split(/\s+/));

const out: string[] = [];
const log = (s = "") => out.push(s);
const summary: any[] = [];
const opaqueAll = new Map<string, { pkg: string; uses: string[]; exported: boolean }>();

for (const p of PKGS) {
  const dir = join(ROOT, p);
  const props: Record<string, any> = JSON.parse(readFileSync(join(dir, "demo/.generated/props.json"), "utf8"));
  const { OUTLINE } = await import(pathToFileURL(join(dir, "demo/outline.ts")).href);
  const pages = OUTLINE.flatMap((r: any) => r.pages);
  const site = siteTextAll[p];

  // exports
  const prog = ts.createProgram(ENTRIES[p].map((e) => join(dir, e)), { jsx: ts.JsxEmit.ReactJSX, allowImportingTsExtensions: true, noEmit: true, moduleResolution: ts.ModuleResolutionKind.Bundler, module: ts.ModuleKind.ESNext, skipLibCheck: true });
  const ch = prog.getTypeChecker();
  const exps: { name: string; kind: string; entry: string }[] = [];
  for (const e of ENTRIES[p]) {
    const sym = ch.getSymbolAtLocation(prog.getSourceFile(join(dir, e)));
    if (!sym) continue;
    for (const s of ch.getExportsOfModule(sym)) {
      const t = s.flags & ts.SymbolFlags.Alias ? ch.getAliasedSymbol(s) : s;
      const isValue = (t.flags & ts.SymbolFlags.Value) !== 0;
      const n = s.name;
      let kind: string;
      if (!isValue) kind = "type";
      else if (/^use[A-Z]/.test(n)) kind = "hook";
      else if (/^[A-Z][A-Z0-9_]+$/.test(n)) kind = "constant";
      else if (/^[A-Z]/.test(n)) {
        // component if callable/forwardRef etc. or has Props type
        kind = "component";
        const decl = t.declarations?.[0];
        const ty = decl ? ch.getTypeOfSymbolAtLocation(t, decl) : undefined;
        const callable = ty && (ty.getCallSignatures().length > 0 || ch.typeToString(ty).includes("Exotic"));
        if (!callable) kind = "value-object";
      } else kind = "function/value";
      exps.push({ name: n, kind, entry: e });
    }
  }
  const required = pages.flatMap((pg: any) => pg.types);
  const named = (n: string) => new RegExp(`(^|[^\\w$-])${n.replace(/\$/g, "\\$")}($|[^\\w$-])`).test(site);
  const pageNamed = (n: string) => pages.some((pg: any) => pg.exports.includes(n) || pg.name === n || pg.types.includes(n));

  const byKind: Record<string, any> = {};
  for (const e of exps) {
    const k = (byKind[e.kind] ??= { total: 0, onImportLineOrPageName: 0, withTable: 0, mentionedOnSite: 0, unmentioned: [] as string[], noTable: [] as string[] });
    k.total++;
    if (pageNamed(e.name)) k.onImportLineOrPageName++;
    const hasTable = allTables.has(e.name) || allTables.has(`${e.name}Props`) || allTables.has(`${e.name}Options`);
    if (hasTable) k.withTable++; else k.noTable.push(e.name);
    if (named(e.name) || siteAll.includes(e.name)) k.mentionedOnSite++; else k.unmentioned.push(e.name);
  }

  // examples
  const exFiles = walk(join(dir, "demo/examples"), /\.tsx$/);
  const scFiles = walk(join(dir, "demo/scenarios"), /\.tsx$/);
  const exText = exFiles.map((f) => ({ f, page: f.split("/examples/")[1].split("/")[0].toLowerCase(), t: readFileSync(f, "utf8") }));
  const scText = scFiles.map((f) => readFileSync(f, "utf8")).join("\n");
  const uses = (name: string, text: string) => {
    const n = name.replace(/\$/g, "\\$");
    return new RegExp(`(^|[\\s{(,<])${n}(\\s*=(?!=)|\\s*:(?!:)|\\s*/?>|\\s*$|\\s*[,}](?=[^\\n]*[}]))`, "m").test(text) ||
      new RegExp(`(^|[\\s])${n}\\s*\\n\\s*[a-zA-Z/>]`, "m").test(text);
  };

  let nProps = 0, nDesc = 0, nDef = 0, nReq = 0, nInh = 0, nOwnEx = 0, nAnyEx = 0, nSc = 0, nOpaque = 0, nLong = 0, nOptNoDefault = 0;
  const typeRows: any[] = [];
  const pageOfType = new Map<string, string>();
  for (const pg of pages) for (const t of pg.types) if (!pageOfType.has(t)) pageOfType.set(t, pg.id);
  for (const [tn, entry] of Object.entries(props)) {
    const pid = pageOfType.get(tn)!;
    const own = exText.filter((x) => x.page === pid).map((x) => x.t).join("\n");
    const any = exText.map((x) => x.t).join("\n");
    let tOwn = 0, tAny = 0, tDef = 0, tOpq = 0;
    const never: string[] = [];
    for (const pr of entry.props) {
      nProps++;
      if (pr.description.trim()) nDesc++;
      if (pr.defaultValue !== undefined) { nDef++; tDef++; }
      if (!pr.optional) nReq++;
      if (pr.optional && pr.defaultValue === undefined) nOptNoDefault++;
      if (pr.inheritedFrom) nInh++;
      if (pr.type.length > 80) nLong++;
      const o = uses(pr.name, own), a = uses(pr.name, any), s = uses(pr.name, scText);
      if (o) { nOwnEx++; tOwn++; }
      if (a) { nAnyEx++; tAny++; }
      if (s) nSc++;
      if (!a && !s) never.push(pr.name);
      const params = new Set(entry.parameter);
      const ids = [...new Set((pr.type.match(/\b[A-Z][A-Za-z0-9_]*\b/g) ?? []) as string[])].filter((i) => !params.has(i) && !BUILTIN.has(i) && i.length > 1);
      const opq = ids.filter((i) => declared.has(i) && !allTables.has(i));
      if (opq.length) { nOpaque++; tOpq++; }
      for (const i of opq) {
        const r = opaqueAll.get(i) ?? { pkg: declared.get(i)!, uses: [], exported: false };
        r.uses.push(`${p}:${tn}.${pr.name}`);
        opaqueAll.set(i, r);
      }
    }
    typeRows.push({ tn, page: pid, n: entry.props.length, def: tDef, own: tOwn, any: tAny, opq: tOpq, never, inherits: entry.inherits, also: entry.alsoTakes });
  }
  // exported-ness of opaque types
  const expSet = new Set(exps.map((e) => e.name));
  for (const [i, r] of opaqueAll) if (expSet.has(i)) r.exported = true;

  summary.push({ p, pages: pages.length, pagesWithTypes: pages.filter((x: any) => x.types.length).length, tables: Object.keys(props).length, nProps, nDesc, nDef, nReq, nOptNoDefault, nInh, nOwnEx, nAnyEx, nSc, nOpaque, nLong, examples: exFiles.length, scenarios: scFiles.length, pagesNoExamples: pages.filter((pg: any) => !exText.some((x) => x.page === pg.id)).map((pg: any) => pg.id), keysPages: pages.filter((x: any) => x.keys).length, limitsPages: pages.filter((x: any) => x.limits).length });
  all[p] = { byKind, typeRows, exps };
}

log("# SUMMARY");
log(JSON.stringify(summary, null, 1));
for (const p of PKGS) {
  log(`\n# ${p} exports by kind`);
  for (const [k, v] of Object.entries(all[p].byKind) as any) log(`${k}: total ${v.total}, onPage ${v.onImportLineOrPageName}, withTable ${v.withTable}, mentionedOnSite ${v.mentionedOnSite}\n  unmentioned: ${v.unmentioned.join(", ")}\n  noTable: ${k === "type" ? "(n/a)" : v.noTable.join(", ")}`);
  log(`\n# ${p} per table`);
  for (const r of all[p].typeRows) log(`${r.tn} [${r.page}] props=${r.n} def=${r.def} ownEx=${r.own} anyEx=${r.any} opaque=${r.opq} inherits=${r.inherits ?? ""} also=${(r.also ?? []).join("+")}\n   never-in-examples/scenarios: ${r.never.join(", ")}`);
}
log("\n# OPAQUE library types used in prop types without a table (sorted by uses)");
for (const [i, r] of [...opaqueAll].sort((a, b) => b[1].uses.length - a[1].uses.length))
  log(`${i} (${r.pkg}${r.exported ? ", exported" : ", NOT exported from that entry"}${siteAll.includes(i) ? "" : ""}) uses=${r.uses.length}: ${r.uses.slice(0, 6).join(" ")}${r.uses.length > 6 ? " …" : ""}`);
writeFileSync(join(process.argv[2]!, "audit.txt"), out.join("\n"));
console.log("ok");
