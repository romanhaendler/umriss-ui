/* The lead case of the chain spec: a costing sheet. Shared by the tests. */

import { Chain, Given, Interim, Plus, Product, Ref, Times } from "../src";

export function costing({ labour = 960 as number | null } = {}) {
  return (
    <Chain>
      <Given id="material" label="Direct material" value={1840} unit="€" />
      <Plus>
        <Product label="Material overhead" unit="€">
          <Given label="Material overhead rate" value={0.12} format="percent" />
          <Ref to="material" />
        </Product>
      </Plus>
      <Interim label="Material cost" unit="€" />
      <Plus id="labour" label="Direct labour" value={labour} unit="€" />
      <Plus>
        <Product label="Production overhead" unit="€">
          <Given label="Production overhead rate" value={1.2} format="percent" />
          <Ref to="labour" />
        </Product>
      </Plus>
      <Interim id="production" label="Production cost" unit="€" />
      <Plus>
        <Product label="Administration and sales overhead" unit="€">
          <Given label="Overhead rate" value={0.15} format="percent" />
          <Ref to="production" />
        </Product>
      </Plus>
      <Interim label="Cost price" unit="€" />
      <Times label="Profit mark-up" value={1.08} />
      <Interim label="Net offer price" unit="€" target={5000} />
    </Chain>
  );
}
