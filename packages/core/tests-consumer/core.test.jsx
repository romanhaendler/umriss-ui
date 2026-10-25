/* What an application's test does with the installed package: it imports the
   entry by its name and uses the components the way a user does. check:dist
   runs this file under Vitest and under Jest, in a project that has only the
   lines core's README gives. `React` is imported because Vite's own transform
   of a .jsx file is the classic one. */

import React, { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Combobox, Modal, ModalBody, ModalHeader, ToastProvider, useToast } from "@umriss-ui/core";
import { GERMAN_WORDING } from "@umriss-ui/core/wording/de";

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

function Screen() {
  const [open, setOpen] = useState(false);
  const [letter, setLetter] = useState(null);
  const { toast } = useToast();
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open settings</button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalHeader title="Settings" />
        <ModalBody>
          <Combobox options={OPTIONS} value={letter} onChange={setLetter} aria-label="Letter" />
        </ModalBody>
      </Modal>
      <button type="button" onClick={() => toast({ title: "Saved", duration: 0 })}>Save</button>
    </>
  );
}

it("opens a modal, picks an option and shows a toast", () => {
  render(
    <ToastProvider>
      <Screen />
    </ToastProvider>,
  );

  fireEvent.click(screen.getByRole("button", { name: "Open settings" }));
  expect(screen.getByRole("dialog", { name: "Settings" })).toBeTruthy();

  fireEvent.click(screen.getByRole("combobox", { name: "Letter" }));
  fireEvent.click(screen.getByRole("option", { name: "Beta" }));
  expect(screen.getByRole("combobox", { name: "Letter" }).value).toBe("Beta");

  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByText("Saved")).toBeTruthy();
});

it("loads the German wording from its subpath", () => {
  expect(GERMAN_WORDING.clearInput).toBe("Eingabe leeren");
});
