import { Lane, Schedule, Subtasks } from "../../../src";
import { PEOPLE, PROJECTS, WORK } from "@umriss-ui/demo/worlds/planning";

export const title = "Plan in office hours only";

export const lead = "Weekdays 09:00 to 17:00 as the `calendar`: a two-week sprint reads as ten working days, with the evenings and the weekend gone.";

const at = (day: number, hours: number) => new Date(2026, 2, day, hours).getTime();

const WORKING_DAYS = [9, 10, 11, 12, 13, 16, 17, 18, 19, 20];
const OFFICE_HOURS = WORKING_DAYS.map((day) => ({ from: at(day, 9), to: at(day, 17) }));

const WEB_TEAM = PEOPLE.filter((person) => person.team === "Web");
const ON_THE_WEB_TEAM = new Set(WEB_TEAM.map((person) => person.id));

export default function OfficeHours() {
  return (
    <Schedule
      ariaLabel="Sprint 14 of the web team, office hours only"
      initialDomain={[at(9, 9), at(20, 17)]}
      calendar={OFFICE_HOURS}
      height={280}
      label={(item) => item.name ?? item.id}
    >
      {WEB_TEAM.map((person) => (
        <Lane key={person.id} id={person.id} label={person.name} />
      ))}
      <Subtasks data={WORK.filter((item) => ON_THE_WEB_TEAM.has(item.lane))} tasks={PROJECTS} />
    </Schedule>
  );
}
