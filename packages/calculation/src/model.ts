/* Reading the declaration (ADR-0027, ADR-0028): from `<Calculation>`'s
   children to a model, before anything is rendered. Pure - no React state, no
   text shown.

   Every quantity gets a key from its place in the nesting, built from the
   React keys `Children.toArray` gives ("0/.0/.$Material"): the caller names
   only what is used twice, and the fold state needs a name for everything.
   A keyed item from `.map` keeps its key when items are added before it, so
   a fold never moves onto another quantity. References are resolved to the
   key of the quantity they name.

   A chain becomes interims - derived quantities like any other: the value
   before (the first quantity, or the previous interim) and the
   operands since. The two forms therefore share evaluation and presentation;
   only reading them differs. */

import { Children, Fragment, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { Chain, Difference, DividedBy, Given, Interim, Minus, Plus, Product, Quotient, Ref, Sum, Times } from "./elements";
import type { ChainOperandProps, GivenProps, OperatorProps, QuantityProps, RefProps } from "./elements";

export type Operator = "sum" | "difference" | "product" | "quotient";

export interface Operand {
  /** The key of the quantity the operand is. */
  key: string;
  /** Whether it stands here as a reference, its derivation elsewhere. */
  reference: boolean;
  /** In a sum: taken away rather than added (a chain's `Minus`). */
  negated?: boolean;
  /** In a chain: the interim before, taken into this one. It is drawn
      where it stands in the chain, not among the interim's operands. */
  previous?: boolean;
}

export interface Quantity extends Omit<QuantityProps, "id"> {
  key: string;
  id?: string;
  /** Given: the number and where it came from. */
  given?: Pick<GivenProps, "value" | "source" | "asOf" | "ages">;
  /** Derived: how, and from what. */
  operator?: Operator;
  operands: readonly Operand[];
  /** Named by an `Interim` of a chain. */
  interim?: boolean;
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

interface LineKind {
  name: string;
  operator: Operator;
  negated?: boolean;
}

const LINES = new Map<unknown, LineKind>([
  [Plus, { name: "Plus", operator: "sum" }],
  [Minus, { name: "Minus", operator: "sum", negated: true }],
  [Times, { name: "Times", operator: "product" }],
  [DividedBy, { name: "DividedBy", operator: "quotient" }],
]);

const QUANTITIES = "<Given>, <Sum>, <Difference>, <Product>, <Quotient> or <Chain>";

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

const childKey = (key: string, child: ReactNode, index: number) =>
  `${key}/${(isValidElement(child) && child.key) || index}`;

/**
 * The model of a calculation. Throws a development error, saying which and
 * where, for anything the calculation cannot evaluate: not exactly one child,
 * a wrong operand count, a duplicate id, a reference to nothing, a cycle
 * through references, an element that is none of the calculation's own, and a
 * chain written against its rules (ADR-0028).
 */
export function readCalculation(children: ReactNode): CalculationModel {
  const top = flatten(children);
  if (top.length !== 1) {
    fail(`<Calculation> takes exactly one child, the result; it was given ${top.length}.`);
  }

  const quantities = new Map<string, Quantity>();
  const ids = new Map<string, string>();
  const refs: { operand: Operand; to: string; where: string }[] = [];

  const define = (key: string, props: QuantityProps, where: string): Quantity => {
    const { id, ...rest } = props;
    if (id !== undefined) {
      if (ids.has(id)) fail(`${where}: the id "${id}" is used twice.`);
      ids.set(id, key);
    }
    const quantity: Quantity = { ...rest, key, id, operands: [] };
    quantities.set(key, quantity);
    return quantity;
  };

  /** An operand: a reference, resolved at the end, or a quantity read here. */
  const operand = (node: ReactNode, key: string, where: string): Operand => {
    if (isValidElement(node) && node.type === Ref) {
      const reference: Operand = { key: "", reference: true };
      refs.push({ operand: reference, to: (node.props as RefProps).to, where });
      return reference;
    }
    return { key: read(node, key, where), reference: false };
  };

  const read = (node: ReactNode, key: string, where: string): string => {
    if (!isValidElement(node) || node.type === Ref || LINES.has(node.type) || node.type === Interim) {
      fail(`${where}: ${nameOf(node)} cannot stand here; a quantity must be ${QUANTITIES}.`);
    }
    if (node.type === Chain) return readChain((node.props as { children?: ReactNode }).children, key, where);
    const operator = OPERATORS.get(node.type);
    if (node.type !== Given && operator === undefined) {
      fail(
        `${where}: ${nameOf(node)} is not an element of the calculation. A calculation reads its children's props and cannot look inside a component of your own; write ${QUANTITIES} or <Ref> directly, or return them from .map.`,
      );
    }
    const { children: operandNodes, value, source, asOf, ages, ...rest } = node.props as GivenProps & OperatorProps;
    const here = `${where} › ${rest.label}`;
    const quantity = define(key, rest, here);
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
    quantity.operands = nodes.map((child, index) => operand(child, childKey(key, child, index), here));
    return key;
  };

  /** A chain, read into interims; gives back the key of its last. */
  const readChain = (lines: ReactNode, key: string, where: string): string => {
    const here = `${where} › <Chain>`;
    const [first, ...rest] = flatten(lines);
    if (first === undefined || (isValidElement(first) && (LINES.has(first.type) || first.type === Interim))) {
      fail(`${here}: a chain starts with a quantity that has no operator - ${QUANTITIES} or <Ref>.`);
    }
    let before = operand(first, childKey(key, first, 0), here);
    let beforeName = nameOf(first);
    let pending: { operand: Operand; line: LineKind }[] = [];
    let last: string | undefined;

    rest.forEach((node, i) => {
      const nodeKey = childKey(key, node, i + 1);
      if (isValidElement(node) && node.type === Interim) {
        const props = node.props as QuantityProps;
        const at = `${here} › ${props.label}`;
        if (pending.length === 0) {
          fail(`${at}: an <Interim> needs an operand since the named value before it, ${beforeName}.`);
        }
        const interim = define(nodeKey, props, at);
        interim.interim = true;
        interim.operator = pending[0]!.line.operator;
        interim.operands = [before, ...pending.map((p) => p.operand)];
        before = { key: nodeKey, reference: false, previous: true };
        beforeName = `<Interim label="${props.label}">`;
        pending = [];
        last = nodeKey;
        return;
      }
      const line = isValidElement(node) ? LINES.get(node.type) : undefined;
      if (line === undefined) {
        fail(`${here}: ${nameOf(node)} needs an operator in a chain - <Plus>, <Minus>, <Times> or <DividedBy> - or is an <Interim>.`);
      }
      const alone = line.operator !== "sum";
      const blocking = pending.find((p) => p.line.operator !== "sum");
      if ((alone && pending.length > 0) || blocking) {
        fail(
          `${here}: <${(blocking ?? { line }).line.name}> stands alone between two named values - directly after the first quantity or an <Interim>, and directly before an <Interim>.`,
        );
      }
      const { children: inner, ...given } = (node as ReactElement<ChainOperandProps>).props;
      const held = flatten(inner);
      const wrong = () => fail(`${here}: <${line.name}> takes either a label and a value, or exactly one quantity as its child.`);
      if (held.length > 0) {
        /* Beside a child any prop would be dropped without a word. */
        if (held.length > 1 || Object.values(given).some((v) => v !== undefined)) wrong();
        /* Marked in place: a reference is resolved on this very object. */
        const heldOperand = operand(held[0], nodeKey, here);
        heldOperand.negated = line.negated;
        pending.push({ operand: heldOperand, line });
        return;
      }
      if (given.label === undefined) wrong();
      const { value, source, asOf, ages, ...quantityProps } = given;
      const quantity = define(nodeKey, { ...quantityProps, label: given.label! }, `${here} › ${given.label}`);
      quantity.given = { value, source, asOf, ages };
      pending.push({ operand: { key: nodeKey, reference: false, negated: line.negated }, line });
    });

    if (pending.length > 0 || last === undefined) {
      fail(`${here}: a chain ends with an <Interim>, which names its value.`);
    }
    return last;
  };

  const result = read(top[0], "0", "<Calculation>");

  for (const { operand: reference, to, where } of refs) {
    const target = ids.get(to);
    if (target === undefined) {
      const known = [...ids.keys()].map((id) => `"${id}"`).join(", ");
      fail(`${where}: <Ref to="${to}"> names no quantity. ${known ? `The ids that exist: ${known}.` : "No quantity has an id."}`);
    }
    reference.key = target;
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
