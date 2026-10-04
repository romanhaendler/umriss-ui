# 02: Chart: hiding series through the view

**What to build:** A legend hides and shows series without a prop or state in the application. The hidden series are part of the chart's view, by `name`, and stand on the hook as `hidden`, `toggleSeries`, `showOnly` and `showAllSeries`. `hidden` on a series and `Legend onToggle` go. A hidden series looks and behaves as today: struck through, out of the extent and the walk, its colour kept. The demo gets the pages 'Legend' and 'View' - the latter keeps a chart's view across a reload, as the table's View page does.

**Blocked by:** 01 (Chart: zoom through the view)

**Status:** ready-for-agent

- [ ] A click on an entry toggles at once, through the view
- [ ] Unknown names in a view fall out; a series without a name has no button
- [ ] The view survives a reload in the 'View' example
- [ ] Pages 'Legend' and 'View' with screenshots
