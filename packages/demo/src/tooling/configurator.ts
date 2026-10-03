/* The configurator, as data (.scratch/configurator).

   A configurator file names props and nothing about them: which control a
   prop becomes, what values it offers and where it starts all come from the
   props table the reader made of the source, so they cannot drift from it.
   A union of literals becomes a choice, a boolean a switch, a number a number
   field; the children text and `placeholder` are the only text. Anything else
   - a callback, a node, an object - has no control, and naming it fails at
   load time, as a prop the table does not have does.

   The code under the stage is written here too: the import line and one
   element, with every prop that still stands at its default left out. */

import type { ComponentType, ReactNode } from "react";
import type { Page } from "../outline";
import type { TypeEntry } from "./propsReader";

export type Value = string | number | boolean | null;

/** A node a required prop starts with - IconButton's glyph - and the code
    that writes it. The names that code uses are the package's, and join the
    import line. */
export interface NodeValue {
  node: ReactNode;
  code: string;
}

const isNode = (value: unknown): value is NodeValue => typeof value === "object" && value !== null && "code" in value;

export interface Control {
  /** The prop's name; `children` for the text between the tags. */
  prop: string;
  /** A segmented choice up to five values, a select above that. */
  kind: "choice" | "select" | "switch" | "number" | "text";
  /** The members of the union, in the order they are written. */
  values?: readonly (string | number)[];
  /** Where the control starts and what Reset returns to - left out of the code. */
  defaultValue: Value;
  /** Set where the default is "whatever is around it" and this is what it
      comes to without anything around it: "md (default)". */
  inherited?: true;
  min?: number;
  max?: number;
  /** A hundredth of the bounds, with the decimals it needs. */
  step?: number;
  decimals?: number;
}

/** What a configurator file declares, beside the component. */
export interface Declaration {
  /** The props the panel controls, in its order. */
  controls: readonly string[];
  /** The text between the tags, where the component takes text. */
  children?: string;
  /** The starting value of every prop the component requires; the code
      always shows these. */
  required?: Readonly<Record<string, Value | NodeValue>>;
  /** The bounds the component documents for a number. */
  bounds?: Readonly<Record<string, readonly [number, number]>>;
}

/** The longest union that still stands as a segmented choice. */
const CHOICE_LIMIT = 5;

/* The two attributes of the element a props table does not list and a
   configurator may still name - each only where the element has it. */
const FROM_THE_ELEMENT: Record<string, { kind: "switch" | "text"; elements: readonly string[] }> = {
  disabled: { kind: "switch", elements: ["<button>", "<input>", "<select>", "<textarea>", "<fieldset>"] },
  placeholder: { kind: "text", elements: ["<input>", "<textarea>"] },
};

/** A union of string and number literals, or nothing. */
function literals(text: string): (string | number)[] | undefined {
  const parts = text.split(" | ").map((part) => {
    try {
      const value: unknown = JSON.parse(part);
      return typeof value === "string" || typeof value === "number" ? value : undefined;
    } catch {
      return undefined;
    }
  });
  return parts.every((part) => part !== undefined) ? (parts as (string | number)[]) : undefined;
}

export function controlsOf(file: string, entry: TypeEntry, declaration: Declaration): Control[] {
  const fail = (prop: string, why: string) => new Error(`\`${file}\` names \`${prop}\`, ${why}.`);
  const controls = declaration.controls.map((prop): Control => {
    const row = entry.props.find((one) => one.name === prop);
    const own = FROM_THE_ELEMENT[prop];
    if (row === undefined && own !== undefined) {
      if (entry.inherits === undefined || !own.elements.includes(entry.inherits)) {
        throw fail(prop, `which ${entry.inherits ?? entry.name} does not have`);
      }
      return { prop, kind: own.kind, defaultValue: own.kind === "switch" ? false : "" };
    }
    if (row === undefined) throw fail(prop, `which ${entry.name} does not have`);
    const cannot = () => fail(prop, `whose type \`${row.type}\` cannot become a control`);

    const declared = declaration.required?.[prop];
    if (isNode(declared)) throw cannot();
    /* A default is code that reads as a value, or a phrase whose last value
       of the union is what it comes to with nothing around it. */
    const values = row.type.endsWith("[]") ? undefined : literals(row.expansion ?? row.type);
    if (values !== undefined) {
      const kind = values.length > CHOICE_LIMIT ? "select" : "choice";
      if (declared !== undefined) return { prop, kind, values, defaultValue: declared };
      if (row.defaultIsPhrase) {
        const said = [...(row.defaultValue ?? "").matchAll(/`([^`]+)`/g)].map(([, code]) => literals(code!)?.[0]);
        const comesTo = said.reverse().find((value) => value !== undefined && values.includes(value));
        if (comesTo === undefined) throw fail(prop, `whose default "${row.defaultValue}" names none of its values`);
        return { prop, kind, values, defaultValue: comesTo, inherited: true };
      }
      const value = row.defaultValue === undefined ? undefined : literals(row.defaultValue)?.[0];
      if (value === undefined || !values.includes(value)) throw fail(prop, "which has no default among its values to start at");
      return { prop, kind, values, defaultValue: value };
    }
    if (row.type === "boolean") {
      return { prop, kind: "switch", defaultValue: declared ?? row.defaultValue === "true" };
    }
    if (row.type === "number") {
      const bounds = declaration.bounds?.[prop];
      const start = declared ?? (row.defaultValue === undefined ? null : Number(row.defaultValue));
      if (Number.isNaN(start)) throw cannot();
      if (bounds === undefined) return { prop, kind: "number", defaultValue: start };
      const [min, max] = bounds;
      const step = (max - min) / 100;
      return { prop, kind: "number", defaultValue: start, min, max, step, decimals: Math.max(0, -Math.floor(Math.log10(step))) };
    }
    throw cannot();
  });
  return declaration.children === undefined
    ? controls
    : [{ prop: "children", kind: "text", defaultValue: declaration.children }, ...controls];
}

/** Every control at its default - where the panel starts and Reset returns. */
export function startOf(controls: readonly Control[]): Record<string, Value> {
  return Object.fromEntries(controls.map((control) => [control.prop, control.defaultValue]));
}

function attribute(prop: string, value: Value | NodeValue): string {
  if (isNode(value)) return `${prop}={${value.code}}`;
  if (value === true) return prop;
  if (typeof value === "string" && !value.includes('"')) return `${prop}="${value}"`;
  return `${prop}={${JSON.stringify(value)}}`;
}

/** The import line and one element: a prop only where it differs from its
    default, a required one always, a required node as its code. */
export function codeOf(
  name: string,
  packageName: string,
  controls: readonly Control[],
  values: Readonly<Record<string, Value>>,
  required: Readonly<Record<string, Value | NodeValue>> = {},
): string {
  const controlled = new Set(controls.map((control) => control.prop));
  const attributes = [
    ...Object.entries(required)
      .filter(([prop]) => !controlled.has(prop) && prop !== "children")
      .map(([prop, value]) => attribute(prop, value)),
    ...controls
      .filter(({ prop }) => prop !== "children")
      .filter(({ prop, defaultValue }) => prop in required || values[prop] !== defaultValue)
      .filter(({ prop }) => values[prop] !== null)
      .map(({ prop }) => attribute(prop, values[prop]!)),
  ];
  const open = [name, ...attributes].join(" ");
  const text = typeof values.children === "string" ? values.children : "";
  const node = isNode(required.children) ? required.children.code : "";
  const inner = text !== "" ? (/[{}<>]/.test(text) ? `{${JSON.stringify(text)}}` : text) : node;
  const element = inner === "" ? `<${open} />` : `<${open}>${inner}</${name}>`;
  const nodes = Object.values(required).filter(isNode).map((one) => one.code);
  const names = new Set([name, ...nodes.flatMap((code) => [...code.matchAll(/<([A-Z]\w*)/g)].map(([, used]) => used!))]);
  return `import { ${[...names].join(", ")} } from "${packageName}";\n\n${element}`;
}

/** A configurator, read and checked: what a page renders in place of its
    first example. */
export interface Configurator {
  /** The page it stands on: the file's name, lower-cased. */
  pageId: string;
  /** The component's name, as the code writes it: the file's name. */
  name: string;
  Component: ComponentType<Record<string, unknown>>;
  controls: readonly Control[];
  required: Readonly<Record<string, Value | NodeValue>>;
}

export interface ConfiguratorModule {
  component?: unknown;
  controls?: unknown;
  children?: unknown;
  required?: unknown;
  bounds?: unknown;
}

const CONFIGURATOR_PATTERN = /\/configurators\/([^/]+)\.tsx$/;

/** `demo/configurators/<Component>.tsx`, each checked against its props
    table - a prop renamed in the source fails here, at load time. */
export function readConfigurators(
  modules: Record<string, ConfiguratorModule>,
  tables: Readonly<Record<string, TypeEntry>>,
  pages: readonly Page[],
): readonly Configurator[] {
  return Object.entries(modules).map(([path, mod]) => {
    const name = CONFIGURATOR_PATTERN.exec(path)?.[1];
    if (name === undefined) throw new Error(`\`${path}\` is not named like a configurator. Expected: configurators/<Component>.tsx`);
    const pageId = name.toLowerCase();
    if (!pages.some((page) => page.id === pageId)) throw new Error(`\`${path}\` is named for a page \`${pageId}\` there is not.`);
    const entry = tables[`${name}Props`];
    if (entry === undefined) throw new Error(`\`${path}\`: there is no props table \`${name}Props\` to read its controls from.`);
    const { component, controls, children, required = {}, bounds } = mod;
    if (component === null || (typeof component !== "function" && typeof component !== "object")) {
      throw new Error(`\`${path}\` exports no \`component\` to render.`);
    }
    if (!Array.isArray(controls) || controls.some((one) => typeof one !== "string")) {
      throw new Error(`\`${path}\` exports no \`controls\`, the props its panel offers.`);
    }
    if (children !== undefined && typeof children !== "string") throw new Error(`\`${path}\` exports \`children\` that are no text.`);
    const declaration = { controls, children, required, bounds } as Declaration;
    return {
      pageId,
      name,
      Component: component as Configurator["Component"],
      controls: controlsOf(path, entry, declaration),
      required: declaration.required ?? {},
    };
  });
}
