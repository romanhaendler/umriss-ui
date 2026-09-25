import { Accordion, AccordionItem } from "../../../src";

export const title = "One section at a time";

/* The first step: `type="single"` is the default - opening one section folds
   the other, and a second click folds the open one. Each header is a button
   inside a heading; the arrow keys move between the headers, Enter and Space
   open. The state belongs to the accordion. */
export default function OneSectionAtATime() {
  return (
    <Accordion defaultValue={["shift"]} style={{ maxWidth: 520 }}>
      <AccordionItem value="shift" title="Shift handover">
        Line 2 ran 7 h 40 min; one stop of 12 min at the capper, cleared by the night shift.
      </AccordionItem>
      <AccordionItem value="quality" title="Quality">
        Three samples taken, all inside the limits. The lab releases batch 0317-B at 11:00.
      </AccordionItem>
      <AccordionItem value="maintenance" title="Maintenance">
        The filler's valve seals are due in 180 operating hours.
      </AccordionItem>
    </Accordion>
  );
}
