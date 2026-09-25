import { useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Stack, Text } from "../../../src";

export const title = "Scroll long content";
export const lead = "When the content is taller than the window, only `ModalBody` scrolls; the header and the buttons stay in view.";

const RULES = [
  "Travel is booked through the travel desk, at least two weeks ahead.",
  "Rail is preferred to air for journeys under four hours.",
  "Hotels are reimbursed up to € 140 a night; more needs the cost-centre owner's approval.",
  "Meals are paid at the daily allowance, not against receipts.",
  "Client entertainment is booked to Sales (CC-1100), whoever pays.",
  "Receipts are uploaded within 30 days, or the claim lapses.",
  "Equipment over € 800 is bought through IT (CC-4300), not claimed.",
  "Training needs the approval of People (CC-4200) before booking.",
  "Mileage is paid at € 0.30 a kilometre for a private car.",
  "Claims in another currency use the rate on the day of payment.",
  "Tips are reimbursed up to 10 % of the bill.",
  "A claim is signed off by the cost-centre owner, then by Finance.",
];

export default function LongContent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Read the expense policy</Button>
      <Modal open={open} onClose={() => setOpen(false)} size="lg">
        <ModalHeader title="Expense policy" description="Valid from 1 January 2026." />
        <ModalBody>
          <Stack gap={4}>
            {RULES.map((rule, index) => (
              <Stack key={rule} gap={1}>
                <Text weight="semibold">§ {index + 1}</Text>
                <Text tone="secondary">{rule}</Text>
              </Stack>
            ))}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>
            I have read it
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
