import { ColumnMenu, Toolbar, useTable } from "../../../src";

export const title = "Group on two levels";
export const lead = "With two keys the cost centres get header rows with their totals, and the suppliers stand once, as a span beside their invoices.";

interface Invoice {
  id: string;
  costCentre: string;
  supplier: string;
  description: string;
  amount: number;
  discount: number | null;
  due: Date;
}

const day = (month: number, d: number) => new Date(2026, month - 1, d);

const INVOICES: Invoice[] = [
  { id: "INV-26-0318", costCentre: "Facilities", supplier: "Brandlow Office Supply", description: "Desk lamps", amount: 1056.24, discount: 117.36, due: day(4, 15) },
  { id: "INV-26-0301", costCentre: "Facilities", supplier: "Brandlow Office Supply", description: "Printer paper", amount: 860, discount: 0, due: day(3, 31) },
  { id: "INV-26-0288", costCentre: "Facilities", supplier: "Brandlow Office Supply", description: "Chairs", amount: 4210, discount: 210.5, due: day(3, 20) },
  { id: "INV-26-0312", costCentre: "Facilities", supplier: "Hartwell Cleaning", description: "Cleaning, March", amount: 2400, discount: null, due: day(4, 10) },
  { id: "INV-26-0290", costCentre: "Facilities", supplier: "Pennock Energy", description: "Electricity, February", amount: 3180, discount: 0, due: day(3, 24) },
  { id: "INV-26-0317", costCentre: "Marketing", supplier: "Kettering & Shaw Events", description: "Trade fair stand", amount: 11_780, discount: 620, due: day(4, 12) },
  { id: "INV-26-0305", costCentre: "Marketing", supplier: "Kettering & Shaw Events", description: "Catering", amount: 3330, discount: 0, due: day(4, 4) },
  { id: "INV-26-0296", costCentre: "Marketing", supplier: "Lumen Print", description: "Brochures", amount: 1940, discount: 97, due: day(3, 28) },
  { id: "INV-26-0284", costCentre: "Marketing", supplier: "Orla Ads", description: "Search ads, February", amount: 5600, discount: null, due: day(3, 18) },
  { id: "INV-26-0309", costCentre: "IT", supplier: "Nimbrel Software", description: "Design tool licences", amount: 5508, discount: 972, due: day(4, 8) },
  { id: "INV-26-0299", costCentre: "IT", supplier: "Nimbrel Software", description: "Onboarding session", amount: 1780, discount: 0, due: day(3, 29) },
  { id: "INV-26-0293", costCentre: "IT", supplier: "Castrel Hosting", description: "Servers, February", amount: 2890, discount: 0, due: day(3, 25) },
  { id: "INV-26-0311", costCentre: "Finance", supplier: "Fenwright Legal", description: "Contract review", amount: 3770, discount: 0, due: day(4, 9) },
];

export default function TwoLevels() {
  const { Table, Column } = useTable(INVOICES, { rowKey: (i) => i.id, defaultGrouping: ["costCentre", "supplier"] });

  return (
    <Table ariaLabel="Invoices by cost centre and supplier">
      <Toolbar>
        <ColumnMenu />
      </Toolbar>
      <Column value="supplier" label="Supplier" />
      <Column value="id" label="Invoice" rowHeader />
      <Column value="costCentre" label="Cost centre" />
      <Column value="description" label="Description" />
      <Column value="amount" label="Amount (€)" format={{ decimals: 2 }} aggregate="sum" />
      <Column value="discount" label="Discount (€)" format={{ decimals: 2 }} aggregate="sum" />
      <Column value="due" label="Due" format="date" aggregate="range" />
    </Table>
  );
}
