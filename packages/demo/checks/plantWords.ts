/* The plant-word check (ADR-0035, demo-rework 07): umriss is for data-dense
   applications, and the plant is one world among several - so the frame must
   not creep back into the packages' code and demos.

   What it scans: every `.ts`/`.tsx` under `packages/<pkg>/src` and
   `packages/<pkg>/demo`, the whole text - code, comments and strings alike,
   because JSDoc and example prose are where the frame shows. Docs are not
   scanned, so `docs/standards.md` may name ISA's terms freely.

   The plant world is `packages/demo/src/worlds/plant.ts` and every file that
   imports `@umriss-ui/demo/worlds/plant`. Plant words are at home there;
   anywhere else each one is an offender, with file, line and word.

   How a word is matched, kept simple on purpose:
   - `PLANT_WORDS`, whole words, case-insensitive. Whole words mean an
     identifier is not a word: `shiftKey`, `shiftTask`, `SHIFT_MINUTES` and
     `ShiftScrap` never match, `plant(17)` and `shift: number` do.
   - `ALLOWED`, a short list of phrases cut from a line before matching: the
     Shift key, "shift" as a verb, `Array.shift()`, a state machine. A new
     false positive gets a phrase here, not a smarter parser.
   - "operator" is deliberately no plant word: it is the calculation's
     arithmetic operator. "line" is none either (a line chart), nor "batch"
     (React batches), "production" or "sensor", which other worlds use.

   The quarter limit: a package's plant examples - `demo/examples/<page>/*.tsx`
   that import the plant world - may be at most a quarter of its examples, and
   of its scenarios (`demo/scenarios/*.tsx`) at most one may play in the plant.

   Pure Node, no browser: the repo-wide run is a unit test
   (`tests-unit/plantWords.repo.test.ts`), so it runs in CI with the others. */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

export const PLANT_WORDS = [
  "plant", "plants",
  "machine", "machines",
  "shift", "shifts",
  "pump", "pumps",
  "kiln", "kilns",
  "furnace", "furnaces",
  "oven", "ovens",
  "boiler", "boilers",
  "conveyor", "conveyors",
  "compressor", "compressors",
  "turbine", "turbines",
  "valve", "valves",
  "reactor", "reactors",
  "tank", "tanks",
  "mill", "mills",
  "spindle", "spindles",
  "setpoint", "setpoints", "set point", "set points",
  "OEE",
  "scrap",
  "control room", "control rooms",
  "work order", "work orders",
  "shop floor",
  "factory", "factories",
] as const;

export const ALLOWED: readonly RegExp[] = [
  // The Shift key: "Shift+click", "Alt+Shift+←", "Shift ×10", "Shift = tenfold", "Shift with the wheel".
  /\bShift(?=\s*[+×=-]|\s+(?:with|and|pans?|multiplies)\b)/g,
  /\b(?:Alt|Ctrl|Cmd)\s+and\s+Shift\b/g,
  // "shift" as a verb, and a grid's offset.
  /\bshifts?\s+(?:the|by|it|its|between|sideways|onto|to|at|when|while|forward|a\s+tick)\b/gi,
  /\b(?:rows|that|would|not|never|may|must|can|cannot|to)\s+shifts?\b/gi,
  /\bshift\s+of\s+a\b/gi,
  // Code: a boolean named for the key, `Array.shift()`.
  /\bshift\s*(?:\?|:\s*boolean)/g,
  /\.shift\(/g,
  /\bstate machines?\b/gi,
];

export interface Offender {
  file: string;
  line: number;
  word: string;
}

export interface QuarterViolation {
  pkg: string;
  kind: "examples" | "scenarios";
  plant: number;
  total: number;
}

export interface Report {
  offenders: Offender[];
  quarter: QuarterViolation[];
}

const WORLD = "packages/demo/src/worlds/plant.ts";
const IMPORTS_PLANT = /from\s+["']@umriss-ui\/demo\/worlds\/plant["']/;
const MATCHER = new RegExp(`\\b(${PLANT_WORDS.map((w) => w.replace(" ", "\\s+")).join("|")})\\b`, "gi");

export const isPlantWorld = (file: string, text: string): boolean => file === WORLD || IMPORTS_PLANT.test(text);

/** The plant words of one text, line by line. */
export function plantWordsIn(file: string, text: string): Offender[] {
  const found: Offender[] = [];
  text.split("\n").forEach((raw, i) => {
    const line = ALLOWED.reduce((l, pattern) => l.replace(pattern, " "), raw);
    for (const match of line.matchAll(MATCHER)) found.push({ file, line: i + 1, word: match[1]! });
  });
  return found;
}

function walk(dir: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  return entries.flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "node_modules" ? [] : walk(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

/** The check over a repository root; every path in the report is relative to it, with `/`. */
export function checkPlantWords(root: string): Report {
  const offenders: Offender[] = [];
  const quarter: QuarterViolation[] = [];
  const packages = readdirSync(join(root, "packages")).sort();
  for (const pkg of packages) {
    const paths = [...walk(join(root, "packages", pkg, "src")), ...walk(join(root, "packages", pkg, "demo"))];
    const plant = new Map<string, boolean>();
    for (const path of paths) {
      const file = relative(root, path).split(sep).join("/");
      const text = readFileSync(path, "utf8");
      const world = isPlantWorld(file, text);
      plant.set(file, world);
      if (!world) offenders.push(...plantWordsIn(file, text));
    }
    const tally = (pattern: RegExp) => {
      const files = [...plant.keys()].filter((f) => pattern.test(f));
      return { plant: files.filter((f) => plant.get(f)).length, total: files.length };
    };
    const examples = tally(new RegExp(`^packages/${pkg}/demo/examples/[^/]+/[^/]+\\.tsx$`));
    const scenarios = tally(new RegExp(`^packages/${pkg}/demo/scenarios/[^/]+\\.tsx$`));
    if (examples.plant * 4 > examples.total) quarter.push({ pkg, kind: "examples", ...examples });
    if (scenarios.plant > 1) quarter.push({ pkg, kind: "scenarios", ...scenarios });
  }
  return { offenders, quarter };
}
