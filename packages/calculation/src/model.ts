/* Reading the declaration (ADR-0027): from `<Calculation>`'s children to a
   model, before anything is rendered. Pure - no React state, no text shown.

   Every quantity gets a key from its place in the nesting, built from the
   React keys `Children.toArray` gives ("0/.0/.$Material"): the caller names
   only what is used twice, and the fold state needs a name for everything.
   A keyed item from `.map` keeps its key when items are added before it, so
   a fold never moves onto another quantity. References are resolved to the key of the
   quantity they name. */

import { Children, Fragment, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { Difference, Given, Product, Quotient, Ref, Sum } from "./elements";
import type { GivenProps, OperatorProps, QuantityProps, RefProps } from "./elements";

export type Operator = "sum" | "difference" | "product" | "quotient";

export interface Operand {
  /** The key of the quantity the operand is. */
  key: string;
  /** Whether it stands here as a reference, its derivation elsewhere. */
  reference: boolean;
}

export interface Quantity extends Omit<QuantityProps, "id"> {
  key: string;
  id?: string;
  /** Given: the number and where it came from. */
  given?: Pick<GivenProps, "value" | "source" | "asOf" | "ages">;
  /** Derived: how, and from what. */
  operator?: Operator;
  operands: readonly Operand[];
}

export interface CalculationModel {
  /** The key of the result. */
  result: string;
  /** Every quantity by key, in the order they stand. */
  quantities: ReadonlyMap<string, Quantity>;
}

const OPERATORS = new Map<unknown, Operator>([
  [Sum, "sum"],
  [Difference, "difference"],
  [Product, "product"],
  [Quotient, "quotient"],
]);

const ELEMENT_NAMES: Record<Operator, string> = {
  sum: "Sum",
  difference: "Difference",
  product: "Product",
  quotient: "Quotient",
};

function fail(message: string): never {
  throw new Error(`@umriss-ui/calculation: ${message}`);
}

/** The children as a flat list: arrays (`.map`) and fragments read through,
    `null`, `false` and `undefined` left out. */
function flatten(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement(child) && child.type === Fragment
      ? flatten((child as ReactElement<{ children?: ReactNode }>).props.children)
      : [child],
  );
}

function nameOf(node: ReactNode): string {
  if (!isValidElement(node)) return JSON.stringify(node);
  const type = node.type as string | { displayName?: string; name?: string };
  return typeof type === "string" ? `<${type}>` : `<${type.displayName ?? type.name ?? "anonymous"}>`;
}

/**
 * The model of a calculation. Throws a development error, saying which and
 * where, for anything the calculation cannot evaluate: not exactly one child,
 * a wrong operand count, a duplicate id, a reference to nothing, a cycle
 * through references, an element that is none of the calculation's own.
 */
export function readCalculation(children: ReactNode): CalculationModel {
  const top = flatten(children);
  if (top.length !== 1) {
    fail(`<Calculation> takes exactly one child, the result; it was given ${top.length}.`);
  }

  const quantities = new Map<string, Quantity>();
  const ids = new Map<string, string>();
  const refs: { operand: Operand; to: string; where: string }[] = [];

  const read = (node: ReactNode, key: string, where: string): string => {
    if (!isValidElement(node) || node.type === Ref) {
      fail(`${where}: ${nameOf(node)} cannot stand here; a quantity must be <Given>, <Sum>, <Difference>, <Product> or <Quotient>.`);
    }
    const operator = OPERATORS.get(node.type);
    if (node.type !== Given && operator === undefined) {
      fail(
        `${where}: ${nameOf(node)} is not an element of the calculation. A calculation reads its children's props and cannot look inside a component of your own; write <Given>, <Sum>, <Difference>, <Product>, <Quotient> or <Ref> directly, or return them from .map.`,
      );
    }
    const { id, children: operandNodes, value, source, asOf, ages, ...rest } = node.props as GivenProps & OperatorProps;
    const here = `${where} › ${rest.label}`;
    if (id !== undefined) {
      if (ids.has(id)) fail(`${here}: the id "${id}" is used twice.`);
      ids.set(id, key);
    }
    const quantity: Quantity = { ...rest, key, id, operands: [] };
    quantities.set(key, quantity);
    if (operator === undefined) {
      quantity.given = { value, source, asOf, ages };
      return key;
    }
    quantity.operator = operator;
    const nodes = flatten(operandNodes);
    const count = nodes.length;
    if (operator === "quotient" ? count !== 2 : count < 2) {
      fail(
        `${here}: <${ELEMENT_NAMES[operator]}> takes ${operator === "quotient" ? "exactly two operands" : "two or more operands"}; it was given ${count}.`,
      );
    }
    quantity.operands = nodes.map((child, index) => {
      if (isValidElement(child) && child.type === Ref) {
        const operand = { key: "", reference: true };
        refs.push({ operand, to: (child.props as RefProps).to, where: here });
        return operand;
      }
      return { key: read(child, `${key}/${(isValidElement(child) && child.key) || index}`, here), reference: false };
    });
    return key;
  };

  const result = read(top[0], "0", "<Calculation>");

  for (const { operand, to, where } of refs) {
    const target = ids.get(to);
    if (target === undefined) {
      const known = [...ids.keys()].map((id) => `"${id}"`).join(", ");
      fail(`${where}: <Ref to="${to}"> names no quantity. ${known ? `The ids that exist: ${known}.` : "No quantity has an id."}`);
    }
    operand.key = target;
  }

  findCycle(quantities);
  return { result, quantities };
}

/** A quantity that depends on itself through references cannot be evaluated. */
function findCycle(quantities: ReadonlyMap<string, Quantity>): void {
  const done = new Set<string>();
  const path: string[] = [];
  const visit = (key: string): void => {
    if (done.has(key)) return;
    const at = path.indexOf(key);
    if (at !== -1) {
      const labels = [...path.slice(at), key].map((k) => quantities.get(k)!.label);
      fail(`the calculation goes round in a circle through references: ${labels.join(" → ")}.`);
    }
    path.push(key);
    for (const operand of quantities.get(key)!.operands) visit(operand.key);
    path.pop();
    done.add(key);
  };
  for (const key of quantities.keys()) visit(key);
}
