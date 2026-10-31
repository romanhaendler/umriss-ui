/* A confirmation that returns a promise and settles with the dialog still open can be given again. */

import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ConfirmDialog } from "../src/components/Modal";

describe("ConfirmDialog onConfirm returning a promise", () => {
  it("allows a retry after a failure, not while pending", async () => {
    let fail!: (error: Error) => void;
    const onConfirm = vi.fn(() => new Promise<void>((_, reject) => (fail = reject)));
    const rejections: unknown[] = [];
    const record = (reason: unknown) => rejections.push(reason);
    process.on("unhandledRejection", record);
    render(<ConfirmDialog open onClose={() => {}} onConfirm={onConfirm} title="T" />);
    const confirm = screen.getByRole("button", { name: "Confirm" });
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await act(async () => fail(new Error("no")));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    fireEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(2);
    process.off("unhandledRejection", record);
  });
});
