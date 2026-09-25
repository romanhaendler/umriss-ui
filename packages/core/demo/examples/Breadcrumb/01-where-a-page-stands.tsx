import { Breadcrumb } from "../../../src";

export const title = "Where a page stands";

/* The first step: the trail from the plant down to the page one is on, each
   level with its address. The last level is the current page - it says
   `aria-current="page"` and is not a link, because it leads nowhere new. The
   whole trail is a navigation landmark with an ordered list, so a screen
   reader can jump to it and count its levels. */
export default function WherePageStands() {
  return (
    <Breadcrumb
      items={[
        { label: "Plant Nord", href: "#/breadcrumb" },
        { label: "Line 3", href: "#/breadcrumb" },
        { label: "Filler F1" },
      ]}
    />
  );
}
