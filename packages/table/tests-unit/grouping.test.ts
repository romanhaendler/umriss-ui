/* The grouping pipeline (table-grouping 01): from the sorted filtered set to row
   groups, their aggregates, their order, and the lines a page shows. The case
   is the prototype's - 13 orders on three lines for eight customers
   (.scratch/table-grouping/prototype). */

import { describe, expect, it } from "vitest";
import { aggregate, dateKey, groupRows, linesOf, livePaths, pageLines } from "../src/model/grouping";
import type { Aggregated, GroupLevel } from "../src/model/grouping";
import { column, tableModel } from "../src/model/tableModel";

interface Order {
  id: string;
  line: string;
  customer: string | null;
  quantity: number;
  scrap: number | null;
  due: Date;
}

const day = (d: number) => new Date(2026, 9, d);

const ORDERS: Order[] = [
  { id: "A-1041", line: "Line 1", customer: "Brenner GmbH", quantity: 1200, scrap: 14, due: day(2) },
  { id: "A-1044", line: "Line 1", customer: "Brenner GmbH", quantity: 800, scrap: 3, due: day(4) },
  { id: "A-1052", line: "Line 1", customer: "Kessler AG", quantity: 2400, scrap: 31, due: day(3) },
  { id: "A-1058", line: "Line 1", customer: "Otto & Söhne", quantity: 600, scrap: 0, due: day(9) },
  { id: "A-1060", line: "Line 1", customer: "Otto & Söhne", quantity: 300, scrap: 2, due: day(11) },
  { id: "A-1061", line: "Line 1", customer: "Otto & Söhne", quantity: 300, scrap: null, due: day(14) },
  { id: "A-1043", line: "Line 2", customer: "Brenner GmbH", quantity: 5000, scrap: 62, due: day(2) },
  { id: "A-1049", line: "Line 2", customer: "Hartmann KG", quantity: 3200, scrap: 18, due: day(6) },
  { id: "A-1055", line: "Line 2", customer: "Lindner Tech", quantity: 1500, scrap: 4, due: day(8) },
  { id: "A-1057", line: "Line 2", customer: "Lindner Tech", quantity: 900, scrap: 1, due: day(10) },
  { id: "A-1046", line: "Line 3", customer: "Kessler AG", quantity: 700, scrap: 9, due: day(5) },
  { id: "A-1050", line: "Line 3", customer: "Vogt Maschinen", quantity: 450, scrap: 0, due: day(7) },
  { id: "A-1053", line: "Line 3", customer: "Weiss Antriebe", quantity: 1100, scrap: 27, due: day(8) },
];

const byLine: GroupLevel<Order> = { id: "line", key: (o) => o.line };
const byCustomer: GroupLevel<Order> = { id: "customer", key: (o) => o.customer };

const ids = (rows: readonly Order[]) => rows.map((o) => o.id);

describe("groupRows – one level", () => {
  it("divides the rows by their value, groups ascending, rows in the order they came", () => {
    const shuffled = [ORDERS[10]!, ORDERS[0]!, ORDERS[6]!, ORDERS[1]!];
    const groups = groupRows(shuffled, { levels: [byLine] });
    expect(groups.map((g) => g.value)).toEqual(["Line 1", "Line 2", "Line 3"]);
    expect(ids(groups[0]!.rows)).toEqual(["A-1041", "A-1044"]);
    expect(groups.every((g) => g.level === 0 && g.groups.length === 0)).toBe(true);
  });
});

describe("groupRows – absent values and levels", () => {
  const withoutCustomer: Order = { id: "A-1070", line: "Line 1", customer: null, quantity: 100, scrap: 0, due: day(20) };

  it("gathers absent values into one group that stands last in either direction", () => {
    const rows = [withoutCustomer, ...ORDERS];
    const up = groupRows(rows, { levels: [byCustomer] });
    expect(up.at(-1)!.value).toBeUndefined();
    expect(ids(up.at(-1)!.rows)).toEqual(["A-1070"]);
    const down = groupRows(rows, { levels: [byCustomer], sort: [{ column: "customer", direction: "desc" }] });
    expect(down[0]!.value).toBe("Weiss Antriebe");
    expect(down.at(-1)!.value).toBeUndefined();
  });

  it("nests the next level inside each group, with a path per group", () => {
    const [line1, line2] = groupRows(ORDERS, { levels: [byLine, byCustomer] });
    expect(line1!.groups.map((g) => g.value)).toEqual(["Brenner GmbH", "Kessler AG", "Otto & Söhne"]);
    expect(line2!.groups.map((g) => g.level)).toEqual([1, 1, 1]);
    // The same customer on two lines is two groups.
    expect(line1!.groups[0]!.path).not.toBe(line2!.groups[0]!.path);
  });
});

describe("aggregates", () => {
  const quantity = (kind: Aggregated<Order>["aggregate"]): Aggregated<Order> => ({ id: "quantity", read: (o) => o.quantity, aggregate: kind });
  const scrap = (kind: Aggregated<Order>["aggregate"]): Aggregated<Order> => ({ id: "scrap", read: (o) => o.scrap, aggregate: kind });
  const line1 = ORDERS.slice(0, 6);

  it("sums and averages the values present, and has none without a value", () => {
    expect(aggregate(scrap("sum"), line1)).toBe(50);
    // A-1061 has no scrap: the average is over five, not six.
    expect(aggregate(scrap("avg"), line1)).toBe(10);
    expect(aggregate(scrap("sum"), [ORDERS[5]!])).toBeUndefined();
  });

  it("takes minimum, maximum and range of numbers and of points in time", () => {
    expect(aggregate(quantity("min"), line1)).toBe(300);
    expect(aggregate(quantity("max"), line1)).toBe(2400);
    const due = (kind: Aggregated<Order>["aggregate"]): Aggregated<Order> => ({ id: "due", read: (o) => o.due, aggregate: kind });
    expect(aggregate(due("min"), line1)).toEqual(day(2));
    expect(aggregate(due("range"), line1)).toEqual([day(2), day(14)]);
  });

  it("counts the values present and the different ones", () => {
    expect(aggregate(scrap("count"), line1)).toBe(5);
    const customer: Aggregated<Order> = { id: "customer", read: (o) => o.customer, aggregate: "distinct" };
    expect(aggregate(customer, line1)).toBe(3);
  });

  it("hands a function of one's own the values present and the rows", () => {
    // The scrap rate: the sum of scrap over the sum of quantity - weighted.
    const rate: Aggregated<Order> = {
      id: "scrap",
      read: (o) => o.scrap,
      aggregate: (values, rows) => (values as number[]).reduce((a, b) => a + b, 0) / rows.reduce((a, o) => a + o.quantity, 0),
    };
    expect(aggregate(rate, line1)).toBeCloseTo(50 / 5600);
  });

  it("computes every group's aggregate from its rows, never from the groups inside it", () => {
    // Line 1 by customer: averages 1000, 2400, 400. Their average would be 1266.67;
    // the average over the six orders is 933.33.
    const [lineOne] = groupRows(ORDERS, { levels: [byLine, byCustomer], aggregates: [quantity("avg")] });
    expect(lineOne!.groups.map((g) => g.aggregates.quantity)).toEqual([1000, 2400, 400]);
    expect(lineOne!.aggregates.quantity).toBeCloseTo(5600 / 6);
  });
});

describe("the order of the groups", () => {
  const scrapSum: Aggregated<Order> = { id: "scrap", read: (o) => o.scrap, aggregate: "sum" };

  it("follows an aggregate when the sort is on its column – on every level", () => {
    const groups = groupRows(ORDERS, {
      levels: [byLine, byCustomer],
      aggregates: [scrapSum],
      sort: [{ column: "scrap", direction: "desc" }],
    });
    expect(groups.map((g) => g.value)).toEqual(["Line 2", "Line 1", "Line 3"]);
    expect(groups[1]!.groups.map((g) => g.value)).toEqual(["Kessler AG", "Brenner GmbH", "Otto & Söhne"]);
  });

  it("takes the first sort level that speaks about a level; a sort on another column leaves the groups", () => {
    const byQuantity = groupRows(ORDERS, { levels: [byLine], aggregates: [scrapSum], sort: [{ column: "quantity", direction: "desc" }] });
    expect(byQuantity.map((g) => g.value)).toEqual(["Line 1", "Line 2", "Line 3"]);
    const lineFirst = groupRows(ORDERS, {
      levels: [byLine],
      aggregates: [scrapSum],
      sort: [
        { column: "line", direction: "desc" },
        { column: "scrap", direction: "desc" },
      ],
    });
    expect(lineFirst.map((g) => g.value)).toEqual(["Line 3", "Line 2", "Line 1"]);
  });
});

describe("lines – what a grouped table shows", () => {
  const groups = groupRows(ORDERS, { levels: [byLine, byCustomer] });
  const shape = (lines: ReturnType<typeof linesOf<Order>>) =>
    lines.map((l) =>
      l.kind === "header"
        ? `H ${String(l.group.value)}${l.continued ? " …" : ""}`
        : l.kind === "folded"
          ? `F ${String(l.group.value)}`
          : `${l.first ? `S ${String(l.span?.value)}${l.continued ? " …" : ""} · ` : ""}${l.row.id}`,
    );

  it("gives outer levels a header and the innermost a span: 16 lines for 13 orders", () => {
    const lines = linesOf(groups, new Set());
    expect(lines).toHaveLength(16);
    expect(shape(lines).slice(0, 5)).toEqual([
      "H Line 1",
      "S Brenner GmbH · A-1041",
      "A-1044",
      "S Kessler AG · A-1052",
      "S Otto & Söhne · A-1058",
    ]);
  });

  it("folds a header to itself and a span to one line; everything folded is a summary", () => {
    const otto = groups[0]!.groups[2]!.path;
    expect(shape(linesOf(groups, new Set([otto]))).slice(0, 6)).toEqual([
      "H Line 1",
      "S Brenner GmbH · A-1041",
      "A-1044",
      "S Kessler AG · A-1052",
      "F Otto & Söhne",
      "H Line 2",
    ]);
    expect(shape(linesOf(groups, new Set(groups.map((g) => g.path))))).toEqual(["H Line 1", "H Line 2", "H Line 3"]);
  });

  it("does not fold a group of one row – it is that row", () => {
    const kessler = groups[0]!.groups[1]!.path;
    expect(shape(linesOf(groups, new Set([kessler])))[3]).toBe("S Kessler AG · A-1052");
  });

  it("makes one level all span", () => {
    const lines = linesOf(groupRows(ORDERS, { levels: [byLine] }), new Set());
    expect(lines).toHaveLength(13);
    expect(lines.every((l) => l.kind === "row" && l.parents.length === 0)).toBe(true);
  });

  it("pages over lines, repeating at the top of a page what it begins inside of", () => {
    const lines = linesOf(groups, new Set());
    const second = pageLines(lines, 2, 5);
    expect(second.pageCount).toBe(4);
    // Line 5 is A-1058, the first of Otto & Söhne; line 6 is A-1060.
    expect(shape(second.lines)).toEqual(["H Line 1 …", "S Otto & Söhne … · A-1060", "A-1061", "H Line 2", "S Brenner GmbH · A-1043", "S Hartmann KG · A-1049"]);
    expect(pageLines(lines, 9, 5).page).toBe(4);
  });
});

describe("date keys", () => {
  it("brings a point in time to the start of its day, ISO week, month or year", () => {
    const at = new Date(2026, 9, 14, 17, 30); // a Wednesday
    expect(dateKey("day")(at)).toEqual(new Date(2026, 9, 14));
    expect(dateKey("week")(at)).toEqual(new Date(2026, 9, 12));
    expect(dateKey("month")(at)).toEqual(new Date(2026, 9, 1));
    expect(dateKey("year")(at)).toEqual(new Date(2026, 0, 1));
    // A Sunday belongs to the week that began on the Monday before it.
    expect(dateKey("week")(new Date(2026, 9, 18))).toEqual(new Date(2026, 9, 12));
    expect(dateKey("month")(null)).toBeUndefined();
  });

  it("groups deliveries by month", () => {
    const due: GroupLevel<Order> = { id: "due", key: (o) => dateKey("month")(o.due) };
    const late = { ...ORDERS[0]!, id: "A-1100", due: new Date(2026, 10, 3) };
    expect(groupRows([...ORDERS, late], { levels: [due] }).map((g) => g.rows.length)).toEqual([13, 1]);
  });
});

describe("folds that outlive their group", () => {
  it("keeps only the folded paths that still occur", () => {
    const groups = groupRows(ORDERS, { levels: [byLine, byCustomer] });
    const otto = groups[0]!.groups[2]!.path;
    expect(livePaths(groups, [otto, JSON.stringify(["value:Line 9"])])).toEqual([otto]);
  });

  it("keeps the group of absent values last when groups follow an aggregate", () => {
    const rows = [{ ...ORDERS[0]!, id: "A-1070", customer: null, scrap: 999 }, ...ORDERS];
    const groups = groupRows(rows, {
      levels: [byCustomer],
      aggregates: [{ id: "scrap", read: (o) => o.scrap, aggregate: "sum" }],
      sort: [{ column: "scrap", direction: "desc" }],
    });
    expect(groups.at(-1)!.value).toBeUndefined();
  });
});

describe("tableModel with a grouping", () => {
  const columns = [
    column<Order>("line", { value: (o) => o.line }),
    column<Order>("customer", { value: (o) => o.customer ?? undefined, searchable: true }),
    column<Order>("quantity", { value: (o) => o.quantity }),
  ];

  it("filters, sorts, then groups, and pages over the lines", () => {
    const projection = tableModel(ORDERS, columns, {
      filter: (o) => o.customer !== "Otto & Söhne",
      sort: { column: "quantity", direction: "desc" },
      pageSize: 4,
      grouping: { levels: [byLine, byCustomer], folded: new Set() },
    });
    expect(projection.filtered).toHaveLength(10);
    // 3 headers and 10 rows.
    expect(projection.lines).toHaveLength(13);
    expect(projection.pageCount).toBe(4);
    // Groups stay in their order - quantity carries no aggregate -, the rows
    // within them follow the sort.
    expect(projection.visible.map((o) => o.id)).toEqual(["A-1041", "A-1044", "A-1052"]);
    expect(tableModel(ORDERS, columns, { filter: (o) => o.customer !== "Otto & Söhne", sort: { column: "quantity", direction: "desc" }, pageSize: 4, page: 2, grouping: { levels: [byLine, byCustomer], folded: new Set() } }).visible.map((o) => o.id)).toEqual(["A-1043", "A-1049", "A-1055"]);
  });

  it("without a grouping has no lines and pages over rows as before", () => {
    const projection = tableModel(ORDERS, columns, { pageSize: 4 });
    expect(projection.lines).toBeUndefined();
    expect(projection.pageCount).toBe(4);
    expect(projection.visible).toHaveLength(4);
  });
});
