/* The server half of the Flight check: a Server Component module writes a
   calculation with the packed package, and React's Flight server renders it
   with the package's client file as a client reference. Prints the payload of
   the case named on the command line. */

import { createElement as h } from "react";
import { renderToPipeableStream } from "react-server-dom-webpack/server";
import { Calculation, Chain, Given, Interim, Plus, Product, Ref, Sum, Times } from "@umriss-ui/calculation";
import { Passthrough } from "./passthrough.client.js";

/* The page's own data. */
const data = { material: 1840, labour: 960, rates: [["Material overhead rate", 0.12], ["Production overhead rate", 1.2]] };

function Costing() {
  return h(
    Calculation,
    { "aria-label": "Costing" },
    h(
      Chain,
      null,
      h(Given, { id: "material", label: "Direct material", value: data.material, unit: "€" }),
      h(Plus, null, h(Product, { label: "Material overhead", unit: "€" }, h(Given, { label: data.rates[0][0], value: data.rates[0][1], format: "percent" }), h(Ref, { to: "material" }))),
      h(Interim, { label: "Material cost", unit: "€" }),
      h(Plus, { id: "labour", label: "Direct labour", value: data.labour, unit: "€" }),
      h(Plus, null, h(Product, { label: "Production overhead", unit: "€" }, h(Given, { label: data.rates[1][0], value: data.rates[1][1], format: "percent" }), h(Ref, { to: "labour" }))),
      h(Interim, { label: "Production cost", unit: "€" }),
      h(Times, { label: "Profit mark-up", value: 1.08 }),
      h(Interim, { label: "Net offer price", unit: "€" }),
    ),
  );
}

/* The tree goes through a client component of the caller's own. */
const Passed = () => h(Passthrough, null, h(Sum, { label: "Total" }, h(Given, { label: "Rate", value: 1 })));

const pages = { costing: Costing, passed: Passed };
const manifest = { "calculation.client.js": { id: "calculation.client.js", chunks: [] }, "passthrough.client.js": { id: "passthrough.client.js", chunks: [] } };
renderToPipeableStream(h(pages[process.argv[2]]), manifest, { onError: () => {} }).pipe(process.stdout);
