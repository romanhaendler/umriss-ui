import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
const ROOT = "/Users/romanhaendler/cc/umriss/packages";
const ts = createRequire(join(ROOT, "demo/package.json"))("typescript");
const PKGS = ["core", "charts", "table", "schedule", "calculation"];
const walk = (d: string): string[] => !existsSync(d) ? [] : readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(join(d, e.name)) : /\.tsx?$/.test(e.name) ? [join(d, e.name)] : []);
const KNOWN = new Set("Omit Pick HTMLAttributes AllHTMLAttributes ButtonHTMLAttributes InputHTMLAttributes SelectHTMLAttributes TextareaHTMLAttributes AnchorHTMLAttributes DialogHTMLAttributes TdHTMLAttributes ThHTMLAttributes TableHTMLAttributes SVGAttributes SVGProps ComponentPropsWithoutRef ComponentPropsWithRef".split(" "));
for (const p of PKGS) {
  const dir = join(ROOT, p);
  const { OUTLINE } = await import(pathToFileURL(join(dir, "demo/outline.ts")).href);
  const req = new Set<string>(OUTLINE.flatMap((r: any) => r.pages.flatMap((pg: any) => pg.types)));
  const props = JSON.parse(readFileSync(join(dir, "demo/.generated/props.json"), "utf8"));
  const decls = new Map<string, any>();
  for (const f of walk(join(dir, "src"))) {
    const sf = ts.createSourceFile(f, readFileSync(f, "utf8"), ts.ScriptTarget.Latest, true);
    sf.statements.forEach((s: any) => { if ((ts.isInterfaceDeclaration(s) || ts.isTypeAliasDeclaration(s)) && !decls.has(s.name.text)) decls.set(s.name.text, s); });
  }
  const dropped: string[] = [], silent: string[] = [], scope: string[] = [];
  const refName = (n: any) => ts.isTypeReferenceNode(n) ? (ts.isIdentifier(n.typeName) ? n.typeName.text : n.typeName.right.text) : ts.isExpressionWithTypeArguments(n) && ts.isIdentifier(n.expression) ? n.expression.text : undefined;
  for (const t of req) {
    const d = decls.get(t);
    const visitMembers = (members: any) => members?.forEach((m: any) => {
      if (ts.isMethodSignature(m) || ts.isIndexSignatureDeclaration(m) || ts.isCallSignatureDeclaration(m)) dropped.push(`${t}: ${m.getText().replace(/\s+/g, " ").slice(0, 90)}`);
    });
    const parts: any[] = [];
    if (ts.isInterfaceDeclaration(d)) { visitMembers(d.members); d.heritageClauses?.forEach((c: any) => parts.push(...c.types)); }
    else {
      const flat = (n: any): void => { if (ts.isUnionTypeNode(n) || ts.isIntersectionTypeNode(n)) n.types.forEach(flat); else if (ts.isParenthesizedTypeNode(n)) flat(n.type); else if (ts.isTypeLiteralNode(n)) visitMembers(n.members); else parts.push(n); };
      flat(d.type);
    }
    for (const part of parts) {
      let n = part; let name = refName(n);
      while ((name === "Omit" || name === "Pick") && n.typeArguments?.[0]) { n = n.typeArguments[0]; name = refName(n); }
      if (name && !KNOWN.has(name) && !decls.has(name)) silent.push(`${t} ⊃ ${part.getText()}`);
      if (!name && !ts.isTypeLiteralNode(part)) silent.push(`${t} ⊃ (non-reference) ${part.getText().slice(0, 60)}`);
    }
    // type identifiers that look like type params not in scope
    const e = props[t];
    const params = new Set(e.parameter);
    for (const pr of e.props) {
      const singles = [...new Set((pr.type.match(/\b[A-Z]\b/g) ?? []) as string[])].filter((x) => !params.has(x));
      if (singles.length) scope.push(`${t}<${e.parameter.join(",")}>.${pr.name}: ${pr.type}  (free: ${singles.join(",")})`);
    }
  }
  // descriptions
  let inProseDefault = 0, specRefs = 0, adrRefs = 0, short = 0, neverType = 0;
  const proseEx: string[] = [], shortEx: string[] = [], specEx: string[] = [];
  for (const [t, e] of Object.entries<any>(props)) for (const pr of e.props) {
    const d = pr.description;
    if (pr.defaultValue === undefined && /\b(default|without (a |it|one|them|a value)|otherwise)\b/i.test(d)) { inProseDefault++; if (proseEx.length < 8) proseEx.push(`${t}.${pr.name}: ${d.split(/(?<=\.)\s/).find((s: string) => /default|without/i.test(s))?.replace(/\n/g, " ")}`); }
    if (/\bR-\d/.test(d)) { specRefs++; if (specEx.length < 6) specEx.push(`${t}.${pr.name}: ${d.replace(/\n/g, " ").slice(0, 100)}`); }
    if (/ADR-\d/.test(d)) adrRefs++;
    if (d.length < 30) { short++; if (shortEx.length < 12) shortEx.push(`${t}.${pr.name} = "${d}"`); }
    if (/(^|\| )never( |$)/.test(pr.type)) neverType++;
  }
  console.log(`\n### ${p}\nmembers silently dropped (methods/index/call sigs) [${dropped.length}]:\n  ${dropped.join("\n  ")}\nheritage parts contributing nothing (not in package src) [${silent.length}]:\n  ${silent.join("\n  ")}\nfree type params [${scope.length}]:\n  ${scope.join("\n  ")}\ndefault-in-prose-only=${inProseDefault} specRefs(R-x)=${specRefs} adrRefs=${adrRefs} descriptions<30chars=${short} neverTypes=${neverType}\n  ${proseEx.join("\n  ")}\n  --short:\n  ${shortEx.join("\n  ")}\n  --spec:\n  ${specEx.join("\n  ")}`);
}
