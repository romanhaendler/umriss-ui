/* One size, one name, one scope (control-sizes 01, ADR-0041).

   Every control with two heights takes `size`; a `ControlSizeProvider` around
   it sets the default; the control's own `size` wins. A surface of its own -
   a popover, a dialog - starts without the provider: a dialog opened from a
   small toolbar keeps the buttons of a dialog.

   The size is read from the class the control sets for it - `sm`, or
   `wrapperSm` and the like - the only trace jsdom has of a height. */

import { describe, expect, it, vi } from "vitest";
import { act, useRef } from "react";
import type { ReactElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  Button,
  ButtonGroup,
  Combobox,
  ControlSizeProvider,
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  DateTimeRangePicker,
  IconButton,
  Input,
  Modal,
  ModalBody,
  MultiSelect,
  NumberInput,
  Popover,
  RadioGroup,
  Select,
  Switch,
  Textarea,
  Tooltip,
} from "../src";
import type { ControlSize } from "../src";

const isSmall = (root: HTMLElement) =>
  [root, ...root.querySelectorAll<HTMLElement>("*")].some((element) =>
    [...element.classList].some((c) => /(^|_)(sm|\w+Sm)_/.test(c)),
  );

/* Each control on its own, with its own size or none. */
const CONTROLS: Record<string, (size?: ControlSize) => ReactElement> = {
  Input: (size) => <Input aria-label="Field" size={size} />,
  Textarea: (size) => <Textarea aria-label="Field" size={size} />,
  NumberInput: (size) => <NumberInput aria-label="Field" size={size} value={null} onChange={() => {}} />,
  Select: (size) => (
    <Select aria-label="Field" size={size}>
      <option>A</option>
    </Select>
  ),
  Combobox: (size) => <Combobox aria-label="Field" size={size} value={null} onChange={() => {}} options={[]} />,
  MultiSelect: (size) => <MultiSelect aria-label="Field" size={size} value={[]} onChange={() => {}} options={[]} />,
  DatePicker: (size) => <DatePicker aria-label="Field" size={size} value={null} onChange={() => {}} />,
  DateTimePicker: (size) => <DateTimePicker aria-label="Field" size={size} value={null} onChange={() => {}} />,
  DateRangePicker: (size) => <DateRangePicker aria-label="Field" size={size} value={null} onChange={() => {}} />,
  DateTimeRangePicker: (size) => (
    <DateTimeRangePicker aria-label="Field" size={size} value={null} onChange={() => {}} />
  ),
  Button: (size) => <Button size={size}>Go</Button>,
  IconButton: (size) => (
    <IconButton aria-label="Go" size={size}>
      ×
    </IconButton>
  ),
  ButtonGroup: (size) => (
    <ButtonGroup aria-label="Group" size={size}>
      <Button>One</Button>
      <Button>Two</Button>
    </ButtonGroup>
  ),
  Switch: (size) => <Switch label="On" size={size} />,
  RadioGroup: (size) => (
    <RadioGroup aria-label="Choice" size={size} value="a" onChange={() => {}} options={[{ value: "a", label: "A" }]} />
  ),
};

describe("a control's size", () => {
  for (const [name, control] of Object.entries(CONTROLS)) {
    describe(name, () => {
      it("is md without a statement", () => {
        const { container } = render(control());
        expect(isSmall(container)).toBe(false);
      });

      it("follows a provider around it", () => {
        const { container } = render(<ControlSizeProvider size="sm">{control()}</ControlSizeProvider>);
        expect(isSmall(container)).toBe(true);
      });

      it("keeps its own size against the provider", () => {
        const { container } = render(<ControlSizeProvider size="sm">{control("md")}</ControlSizeProvider>);
        expect(isSmall(container)).toBe(false);
      });

      it("says sm on its own", () => {
        const { container } = render(control("sm"));
        expect(isSmall(container)).toBe(true);
      });
    });
  }
});

describe("a surface of its own starts without the provider", () => {
  it("a popover's content", () => {
    function Setup() {
      const anchor = useRef<HTMLButtonElement>(null);
      return (
        <ControlSizeProvider size="sm">
          <button ref={anchor}>Anchor</button>
          <Popover open onOpenChange={() => {}} anchorRef={anchor} role="dialog" ariaLabel="Surface">
            <Button>Inside</Button>
          </Popover>
        </ControlSizeProvider>
      );
    }
    render(<Setup />);
    expect(isSmall(screen.getByRole("button", { name: "Inside" }))).toBe(false);
  });

  it("a tooltip's content", () => {
    vi.useFakeTimers();
    try {
      render(
        <ControlSizeProvider size="sm">
          <Tooltip content={<Button>Inside</Button>}>
            <span>Target</span>
          </Tooltip>
        </ControlSizeProvider>,
      );
      fireEvent.pointerEnter(screen.getByText("Target"));
      act(() => vi.advanceTimersByTime(400));
      expect(isSmall(screen.getByRole("button", { name: "Inside", hidden: true }))).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("a modal's content", () => {
    render(
      <ControlSizeProvider size="sm">
        <Modal open onClose={() => {}} aria-label="Dialog">
          <ModalBody>
            <Button>Inside</Button>
          </ModalBody>
        </Modal>
      </ControlSizeProvider>,
    );
    expect(isSmall(screen.getByRole("button", { name: "Inside", hidden: true }))).toBe(false);
  });
});
