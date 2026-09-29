import { IconButton } from "../../../src";

export const title = "Name the icon";
export const lead = "`aria-label` is required: it is the name a screen reader announces and the tooltip a sighted reader sees on hover or keyboard focus.";

function Refresh() {
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true">
      <path d="M8.3 5.8A3.4 3.4 0 1 1 7.6 2.7M7.9 1.2v1.8H6.1" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function NameTheIcon() {
  return (
    <IconButton aria-label="Refresh the tours">
      <Refresh />
    </IconButton>
  );
}
