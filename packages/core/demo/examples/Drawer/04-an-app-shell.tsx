import { useState, useSyncExternalStore } from "react";
import { Button, Drawer, Link, ModalBody, ModalHeader, Text } from "../../../src";

export const title = "An app shell";
export const lead =
  "A frame is layout, so it is your application's: the same links stand in a side column or in a drawer, and your router's own link (react-router's `NavLink` sets `aria-current` itself) replaces core's `Link`.";

const PAGES = ["Overview", "Shipments", "Tours", "Settings"];
const NARROW = "(max-width: 719px)";

/* A few lines of `matchMedia`: core has no media hook. */
function useNarrow(): boolean {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia(NARROW);
      query.addEventListener("change", notify);
      return () => query.removeEventListener("change", notify);
    },
    () => window.matchMedia(NARROW).matches,
    () => false,
  );
}

export default function AnAppShell() {
  const narrow = useNarrow();
  const [page, setPage] = useState("Overview");
  const [open, setOpen] = useState(false);

  const links = (
    <nav aria-label="Main">
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "var(--u-space-1)" }}>
        {PAGES.map((name) => (
          <li key={name}>
            <Text as="span">
            <Link
              href="#"
              aria-current={name === page ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                setPage(name);
                setOpen(false);
              }}
              style={{ display: "block", padding: "var(--u-space-2) var(--u-space-3)", fontWeight: name === page ? 600 : 400 }}
            >
              {name}
            </Link>
          </Text>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <div style={{ border: "1px solid var(--u-hairline)", borderRadius: 8, overflow: "hidden" }}>
      <header
        style={{ display: "flex", alignItems: "center", gap: "var(--u-space-3)", padding: "var(--u-space-3) var(--u-space-4)", borderBottom: "1px solid var(--u-hairline)" }}
      >
        {narrow && (
          <Button size="sm" variant="secondary" aria-haspopup="dialog" onClick={() => setOpen(true)}>
            Menu
          </Button>
        )}
        <Text weight="semibold">Fleet Planner</Text>
      </header>
      <div style={{ display: "flex", minHeight: 200 }}>
        {!narrow && <div style={{ width: 200, padding: "var(--u-space-3)", borderInlineEnd: "1px solid var(--u-hairline)" }}>{links}</div>}
        <main style={{ flex: 1, minWidth: 0, padding: "var(--u-space-4)" }}>
          <Text as="h3" size="lg" weight="semibold">
            {page}
          </Text>
        </main>
      </div>
      <Drawer side="left" open={narrow && open} onClose={() => setOpen(false)}>
        <ModalHeader title="Fleet Planner" />
        <ModalBody>{links}</ModalBody>
      </Drawer>
    </div>
  );
}
