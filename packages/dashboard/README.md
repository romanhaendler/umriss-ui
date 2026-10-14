# @umriss-ui/dashboard

Widgets a developer declares, shown in the order a view stores them, each at its size, packed on twelve columns. Takes `@umriss-ui/core` and React 19 as peers.

```bash
npm install @umriss-ui/dashboard @umriss-ui/core
```

```tsx
const { Dashboard, WidgetType } = useDashboard({ defaultView });

<Dashboard aria-label="Start">
  <WidgetType name="figure" label="Figure" sentence="One number." sizes={{ small: { columns: 3, rows: 2 } }} start="small" defaultOptions={{ name: "Orders" }}>
    {({ size, options }) => <Text>{options.name}</Text>}
  </WidgetType>
</Dashboard>
```

The demo is the documentation: `pnpm dev:dashboard`. Every export is listed in [API.md](API.md).
