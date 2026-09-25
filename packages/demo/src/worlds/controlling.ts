/**
 * The controlling world: Carrow & Lisle, a mid-sized maker of office
 * furniture, and its finance team's view of the year 2026.
 *
 * The standing cast:
 * - `COST_CENTRES` - nine cost centres with their owner and monthly budget;
 * - `MONTHS` and `LEDGER` - per cost centre and month: the budget, the actual
 *   where the month is closed (January and February), the forecast for every
 *   month; Marketing overspends, IT runs under;
 * - `INVOICES` - incoming invoices with their lines (quantity, unit price,
 *   discount, VAT rate), and `APPROVALS`, who signed which, or has yet to.
 *
 * Amounts in euros. "Now" is Tuesday, 17 March 2026. Plain data and small pure
 * functions, no imports: copy the file beside an example and it runs.
 */

/** A small LCG - the same numbers on every machine. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const on = (month: number, day: number) => new Date(2026, month - 1, day).getTime();

export interface CostCentre {
  id: string;
  name: string;
  owner: string;
  /** The budget of one month. */
  monthlyBudget: number;
}

export const COST_CENTRES: readonly CostCentre[] = [
  { id: "CC-1100", name: "Sales", owner: "Helen Marsh", monthlyBudget: 142_000 },
  { id: "CC-1200", name: "Marketing", owner: "Rafael Ortiz", monthlyBudget: 68_000 },
  { id: "CC-2100", name: "Engineering", owner: "Anika Sørensen", monthlyBudget: 188_000 },
  { id: "CC-2200", name: "Design", owner: "Paul Whitaker", monthlyBudget: 54_000 },
  { id: "CC-3100", name: "Customer service", owner: "Grace Obi", monthlyBudget: 61_000 },
  { id: "CC-4100", name: "Finance", owner: "Martina Vogel", monthlyBudget: 47_000 },
  { id: "CC-4200", name: "People", owner: "Daniel Frost", monthlyBudget: 39_000 },
  { id: "CC-4300", name: "IT", owner: "Kenji Arai", monthlyBudget: 83_000 },
  { id: "CC-4400", name: "Facilities", owner: "Olga Ivanova", monthlyBudget: 72_000 },
];

/** The year's months, as `"2026-01"` … `"2026-12"`. */
export const MONTHS: readonly string[] = Array.from({ length: 12 }, (_, i) => `2026-${String(i + 1).padStart(2, "0")}`);

/** The months whose books are closed: they have an actual. */
export const CLOSED_MONTHS = 2;

export interface LedgerRow {
  costCentre: string;
  month: string;
  budget: number;
  /** `null` while the month is open. */
  actual: number | null;
  forecast: number;
}

/* Where a cost centre lands against its budget, as a factor: Marketing's
   spring campaign overspends, IT's delayed licences underspend. */
const TENDENCY: Readonly<Record<string, number>> = { "CC-1200": 1.14, "CC-4300": 0.88 };

/** Budget, actual and forecast of every cost centre in every month. */
export const LEDGER: readonly LedgerRow[] = COST_CENTRES.flatMap((centre, c) => {
  const r = random(310 + c);
  const tendency = TENDENCY[centre.id] ?? 1;
  return MONTHS.map((month, m) => {
    /* December pays the bonuses, August is the quiet month. */
    const season = m === 11 ? 1.12 : m === 7 ? 0.9 : 1;
    const budget = Math.round(centre.monthlyBudget * season);
    const forecast = Math.round((budget * (tendency + (r() - 0.5) * 0.06)) / 100) * 100;
    const actual = m < CLOSED_MONTHS ? Math.round(forecast * (1 + (r() - 0.5) * 0.08)) : null;
    return { costCentre: centre.id, month, budget, actual, forecast };
  });
});

export interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  /** A fraction: 0.1 is ten per cent off. */
  discount: number;
  /** A fraction: 0.19 or 0.07, or 0 where no VAT is charged. */
  vatRate: number;
}

export interface Invoice {
  id: string;
  supplier: string;
  costCentre: string;
  received: number;
  due: number;
  status: "awaiting approval" | "approved" | "paid" | "rejected";
  lines: readonly InvoiceLine[];
}

export const INVOICES: readonly Invoice[] = [
  {
    id: "INV-26-0318", supplier: "Brandlow Office Supply", costCentre: "CC-4400", received: on(3, 16), due: on(4, 15), status: "awaiting approval",
    lines: [
      { description: "Desk lamps, LED", quantity: 24, unitPrice: 48.9, discount: 0.1, vatRate: 0.19 },
      { description: "Printer paper, box of 5 reams", quantity: 40, unitPrice: 21.5, discount: 0, vatRate: 0.19 },
      { description: "Delivery", quantity: 1, unitPrice: 35, discount: 0, vatRate: 0.19 },
    ],
  },
  {
    id: "INV-26-0317", supplier: "Kettering & Shaw Events", costCentre: "CC-1200", received: on(3, 13), due: on(4, 12), status: "awaiting approval",
    lines: [
      { description: "Trade fair stand, 3 days", quantity: 1, unitPrice: 12_400, discount: 0.05, vatRate: 0.19 },
      { description: "Catering, per guest", quantity: 180, unitPrice: 18.5, discount: 0, vatRate: 0.07 },
    ],
  },
  {
    id: "INV-26-0309", supplier: "Nimbrel Software", costCentre: "CC-4300", received: on(3, 9), due: on(4, 8), status: "approved",
    lines: [
      { description: "Design tool licences, annual", quantity: 12, unitPrice: 540, discount: 0.15, vatRate: 0.19 },
      { description: "Onboarding session", quantity: 2, unitPrice: 890, discount: 0, vatRate: 0.19 },
    ],
  },
  {
    id: "INV-26-0302", supplier: "Fenwright Legal", costCentre: "CC-4100", received: on(3, 2), due: on(3, 16), status: "paid",
    lines: [{ description: "Contract review, hours", quantity: 14.5, unitPrice: 260, discount: 0, vatRate: 0.19 }],
  },
  {
    id: "INV-26-0226", supplier: "Corrin Travel", costCentre: "CC-1100", received: on(2, 26), due: on(3, 12), status: "paid",
    lines: [
      { description: "Rail tickets, sales conference", quantity: 22, unitPrice: 139, discount: 0, vatRate: 0.07 },
      { description: "Hotel, nights", quantity: 44, unitPrice: 112, discount: 0.08, vatRate: 0.07 },
    ],
  },
  {
    id: "INV-26-0221", supplier: "Stellbrook Consulting", costCentre: "CC-2100", received: on(2, 21), due: on(3, 23), status: "rejected",
    lines: [{ description: "Architecture review, days", quantity: 6, unitPrice: 1450, discount: 0, vatRate: 0 }],
  },
];

export interface Approval {
  invoice: string;
  step: "cost centre" | "finance";
  approver: string;
  decision: "approved" | "rejected" | "pending";
  at?: number;
  comment?: string;
}

/** Two signatures an invoice needs: its cost centre's owner, then finance. */
export const APPROVALS: readonly Approval[] = [
  { invoice: "INV-26-0318", step: "cost centre", approver: "Olga Ivanova", decision: "pending" },
  { invoice: "INV-26-0317", step: "cost centre", approver: "Rafael Ortiz", decision: "approved", at: on(3, 16) },
  { invoice: "INV-26-0317", step: "finance", approver: "Martina Vogel", decision: "pending" },
  { invoice: "INV-26-0309", step: "cost centre", approver: "Kenji Arai", decision: "approved", at: on(3, 10) },
  { invoice: "INV-26-0309", step: "finance", approver: "Martina Vogel", decision: "approved", at: on(3, 11) },
  { invoice: "INV-26-0302", step: "cost centre", approver: "Martina Vogel", decision: "approved", at: on(3, 3) },
  { invoice: "INV-26-0302", step: "finance", approver: "Martina Vogel", decision: "approved", at: on(3, 3) },
  { invoice: "INV-26-0226", step: "cost centre", approver: "Helen Marsh", decision: "approved", at: on(2, 27) },
  { invoice: "INV-26-0226", step: "finance", approver: "Martina Vogel", decision: "approved", at: on(3, 2) },
  { invoice: "INV-26-0221", step: "cost centre", approver: "Anika Sørensen", decision: "rejected", at: on(2, 24), comment: "Not ordered - the review was cancelled in January." },
];
