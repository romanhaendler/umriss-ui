import { Calculation, Given, Quotient, Sum } from "../../../src";

export const title = "A number that is not there yet";
export const lead = "A given with `value={null}` shows as missing, and so does every figure that depends on it – never carried on as zero.";

const BOOKED = [
  { name: "Luis Moreno", hours: 34 },
  { name: "Hana Sato", hours: 38 },
  { name: "Kofi Mensah", hours: null },
  { name: "Freya Olsen", hours: 36 },
  { name: "David Kowalski", hours: 17 },
];

export default function Missing() {
  return (
    <Calculation aria-label="Utilisation of the Apps team, week 11">
      <Quotient label="Utilisation, Apps team" format="percent" target={0.85}>
        <Sum label="Hours booked" unit="h">
          {BOOKED.map((person) => (
            <Given key={person.name} label={person.name} value={person.hours} unit="h" source="Timesheets" />
          ))}
        </Sum>
        <Given label="Capacity, Apps team" value={172} unit="h" />
      </Quotient>
    </Calculation>
  );
}
