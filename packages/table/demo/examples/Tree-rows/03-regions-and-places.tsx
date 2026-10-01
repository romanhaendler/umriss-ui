import { useTable } from "../../../src";

export const title = "Regions and places";
export const lead = "One country has states, another goes straight to its cities: the tree stands as deep as each branch is. A column only places carry stays empty on a country - one column set for every level, absent where a level has no value.";

interface Place {
  id: string;
  name: string;
  sites: number;
  /** Only places have a postcode. */
  postcode?: string;
  children?: Place[];
}

const PLACES: Place[] = [
  {
    id: "de",
    name: "Germany",
    sites: 5,
    children: [
      {
        id: "de-by",
        name: "Bavaria",
        sites: 3,
        children: [
          { id: "de-by-muc", name: "Munich", sites: 2, postcode: "80331" },
          { id: "de-by-nue", name: "Nuremberg", sites: 1, postcode: "90402" },
        ],
      },
      { id: "de-hh", name: "Hamburg", sites: 2, postcode: "20095" },
    ],
  },
  {
    id: "nl",
    name: "Netherlands",
    sites: 2,
    children: [
      { id: "nl-ams", name: "Amsterdam", sites: 1, postcode: "1012" },
      { id: "nl-rtm", name: "Rotterdam", sites: 1, postcode: "3011" },
    ],
  },
  { id: "lu", name: "Luxembourg", sites: 1, postcode: "1009" },
];

export default function RegionsAndPlaces() {
  const { Table, Column } = useTable(PLACES, { rowKey: (p) => p.id, childRows: (p) => p.children, defaultBranches: 2 });
  return (
    <Table ariaLabel="Sites by region">
      <Column value="name" label="Region" rowHeader />
      <Column value="sites" label="Sites" />
      <Column value="postcode" label="Postcode" />
    </Table>
  );
}
