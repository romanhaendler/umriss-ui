import { Accordion, AccordionItem } from "../../../src";

export const title = "One section at a time";
export const lead = "By default opening one section folds the other; `defaultValue` names the sections open at the start.";

export default function OneSectionAtATime() {
  return (
    <Accordion defaultValue={["goal"]} style={{ maxWidth: 520 }}>
      <AccordionItem value="goal" title="Sprint goal">
        Member portal sign-in and profile, ready for Rowan Credit Union's review on Friday.
      </AccordionItem>
      <AccordionItem value="finished" title="Finished work">
        Sign-in form, password reset and the profile page's layout: 46 of 120 hours.
      </AccordionItem>
      <AccordionItem value="carried" title="Carried over">
        Two-factor codes by text message, waiting for the provider's contract.
      </AccordionItem>
    </Accordion>
  );
}
