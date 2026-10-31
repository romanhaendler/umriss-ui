# Defects of earlier runs, status at 0.51.0

Status: needs-triage

Five agents read every defect of the runs of 2026-10-24 (`.scratch/shakedown/`) and 2026-10-28 against the source at 0.51.0; the unclear ones were settled in Chromium (last section). Only open and unclear items are listed - the rest is fixed or decided. Taken into `spec.md`.

## 10-24 core/core-screens/design-system/design-family/zoom: open/unclear
- open M core B1: FormData (= this run #13, decided: hidden inputs, formats chosen)
- open M core B2: Popover/Menu/Tooltip in foreign (Radix) dialog invisible; Escape closes both (portalTarget.ts:25 closest("dialog") only) (= #34)
- open M core B3 rest: shadow root/iframe: overlays/toasts/announcer leave root; listeners on global document (Popover.tsx:230-231); no recipe
- open S core B5: muted token 3.41/4.07:1 (tokens.css:40); contrast.test.ts:146-165 exception; Typography doc promises threshold
- open S core B6: no Modal scroll lock; comments claim it (Modal.tsx:26,51,77)
- open S core B10: announcer region + 150ms timer module state leak into next test (announce.ts:22-24,70-73); silence not exported
- open S core B11 rest: Tooltip.children / Menu.trigger typed ReactElement<Record<string, unknown>> (Tooltip.tsx:20, Menu.tsx:72)
- open S core B12: README principle 2 lists only Combobox/MultiSelect as exceptions; NumberInput & pickers lack defaultValue (README:472-475)
- open S core C asOf: ISO string asOf reads "No connection", no warning (freshness.ts:38-42)
- open S core C ModalHeader: children instead of title renders empty h2 (Modal.tsx:199-208)
- open S core C Combobox: typing into a valued Combobox appends to label (Combobox.tsx:236-262; no select on focus)
- open S core C README: no form example in core README
- open S core D Badge: overflows parent (Badge.module.css:19 nowrap, no ellipsis)
- open M core D DatePicker at 32px root: weekday names run together, Sunday cut (DatePicker.module.css:88 266px)
- open S core D buttons: disabled ghost/plain 1.6-1.9:1; danger button focus ring 1.3:1 (Button.module.css:39-42, 205-225)
- open M core D toast over Drawer covers footer button
- open S core D TreeView labels no title/tooltip
- open S core E Sparkline aria-label on role-less span (Sparkline.tsx:47-52)
- open S core-screens 2: Button loading focus (= #31)
- open S core-screens 3: Checkbox invalid (= #32)
- open S core-screens 6: disabled primary in dark light grey block (= #37)
- open S core-screens 7: VisuallyHidden position:absolute overflow in non-positioned scroller
- open S core design-system 7: no API/props file in tarball (wish-shaped)
- open S core/table/charts design-system 9: no token for button disabled opacity, virtual-row focus ring, --uc-shadow literal
- open S dashboard design-family 2: Stat in widget is card in card
- open M charts design-family 3 / zoom 5: chart ticks/titles/legend px, do not grow with root (charts.css:41-43)
- open S charts design-family 4: empty chart shows legend and axes under "No data" (AxesHtml.tsx:170-190)
- open S table design-family 5: numeric headers ~14px left of numbers (sort indicator slot) (Table.module.css:491-497,540) - maybe deliberate
- open S calc/table design-family 6: minus U+002D vs U+2212 - decided? (issue 15: sign is locale's) 
- open S core/charts design-family 7: two tooltip looks - maybe deliberate
- open S table design-family 8: loading table shows 0 count and "Page 1 of 1" under skeleton (rowlessParts.tsx:576-588,667)
- open M core zoom 1: pinch-zoomed page: date/MultiSelect panels wider than visual viewport (Popover.module.css:14, position.ts:149)
- open S schedule/charts zoom 2: pinch zoom blocked over plots (touch-action none/pan-y)
- open S core zoom 3: on touch field text stays 16px at raised root (own.module.css:137-147)
- open M core zoom 4: Toast/Modal/Drawer against layout viewport, off-screen when pinch-zoomed
- open S core zoom 6: no touch-action: manipulation on controls
- unclear core: Popover with clipped anchor in scroll container
- unclear core: stacked FormFields no gap
- unclear core: Select panel 4px narrower than field; Splitter invisible at rest; Drawer whole screen at 375; MultiSelect chips Chromium vs WebKit
- unclear schedule design-family 11: lane gutter 40% at 375 (deliberate?)
- unclear core onChange events vs values (decision, L)
- CONFLICT core-screens 5 radios: source says circle (RadioGroup.module.css:69) but P9 and H5 screenshots show rounded squares

## 10-24 table/table-export/accessibility/qa/security: open/unclear
- open M table table.md 4/export 7: selection.count ghost keys; README:292 "count follows the rows" false (= this run #3)
- open S table table.md 8: print shows toolbar/search/pager, only current page (hide chrome; rest roadmap P3)
- open S table table.md 10/export 9: CSV writes 1e+21, Infinity, float noise raw (csv.ts:46)
- open M table export 1: grouped table exports ungrouped (export.ts:111) (= this run #23 doc drift)
- open S table export 2: visible "other"-kind column dropped silently without exportValue (export.ts:51-60; documented)
- open S table export 3: mixed column judged by first present value (registry.ts:492 kindOf)
- open S table export 4: column without label exports id as header (export.ts:19-21)
- open S table export 5: tree search exports ancestors as plain rows; selectionAsText no level column (README:205)
- open S table export 8: toggleColumn on rowHeader column lists it in hidden (tableState.ts:369)
- open M core qa 4c: muted text token 3.41:1 (tokens.css:40); TextTone doc promises threshold (= this run #37)
- open S core qa 4c: toast counter "1 / 3" named "3 messages, show all" (Toast.tsx:431-436)
- open S core qa 6: Cypress {esc} does not close Modal (Modal.tsx:155-158 onCancel only)
- open S core qa 7: WebKit mouse-opened Modal no focus return (dialogChoreography; no opener remembered) (~ this run #33)
- open S core qa 8: toast close buttons all "Close message"; Popover no default role/name, anchor no aria-expanded/controls; MultiSelect/DatePicker dialogs named "Select"/"Select date" not by field (MultiSelect.tsx:511, DatePicker.tsx:171); MultiSelect options are checkboxes
- open S dashboard P10-1: Edit/Done/Cancel drop focus; Edit announces nothing (Dashboard.tsx:266-279, useDashboard.ts:133-136)
- open M core P10-3: picked date not announced / not in trigger name (= this run #36)
- open M table P10-4: sort silent, export silent, search count no noun (= this run #36)
- open S core P10-5: DateTimePicker hour/minute textbox not spinbutton (TimeField.tsx:73)
- open M core P10-7: every MultiSelect option own Tab stop (MultiSelect.tsx:566-600)
- open S calculation P10-8: disclosure buttons carry no figure (Calculation.tsx:335-337)
- open S schedule P10-11: "Abhängigkeit 0 Min" read for no lag (ScheduleTooltip.tsx:63,118)
- open S charts P10-12: summary extremes name no x (sceneSpeech.ts:146)
- open S core P11-2: Tab out of open DatePicker panel -> body, panel stays open
- open S charts P11-8: legend after plot in Tab order though shown above (Chart.tsx:413-424 CSS order)
- open S core P12-2: Alert tone by colour only, no glyph (Alert.tsx:48-62)
- open S core P12-3: Stat in a flex row collapses to 34 px (Stat.module.css:11 no min-inline-size)
- open S charts P12-5: legend 12.5px and limit labels do not grow at root 32 px (charts.css:50)
- open S core P12-6: MultiSelect two nested scrollers at 320x256 (MultiSelect.module.css:378)
- open S core security 2: Link does not sanitise href (data:, vbscript:) (Typography.tsx:160); doc at least
- open S table security 3: Export filename unvalidated into a.download (rowlessParts.tsx:501)
- open S all security 4: published package.json carries dev scripts
- unclear core P11-3: Tab+Enter alone cannot change RadioGroup/Segmented/Tabs/Slider (APG; decision)
- unclear core P11-4: toast Undo ~100 Tabs away, Alt+T not visible (decision)
- unclear core/table P11-7: focus rings two systems; sort-header ring clipped (screenshot)
- unclear charts P12-1: series by colour alone by default; encoding="marks" opt-in (decision on default)
- unclear schedule/dashboard P12-4/7: schedule plot ~165px at 320; widget title truncates under text spacing (render)
- unclear core P12-8: toast far from trigger, leaves after 5.3 s (decision)
- unclear core P10-6/13: Combobox/palette double announce; Modal opens on Close; NumberInput € outside name (render/SR)
- unclear core qa 4a/b: axe region fails on portalled panels; two widgets share landmark name
- unclear core qa 9: inline Checkbox then Switch overlap (render)

## 10-24 package files (charts, schedule, calculation, dashboard, data-science, reports-bi): open/unclear
- open M charts charts.md 1: theme switch on ancestor other than <html> leaves canvas old colours (theme.ts:181-183 observes documentElement only)
- open S charts charts.md 2: values near 1e-9 give y ticks all 0.000000 (format.ts:63 cap 6, formatValue cap 3)
- open S core token charts.md 3 / dashboard.md 8 / core B5: muted text 3.4:1 (tokens.css:40 #8b8b8b/#77777e) (= this run #37)
- open S charts charts.md 5: series naming missing field -> "No data" without DEV message (sceneChecks.ts)
- open S schedule schedule.md 3: tooltip times only, no date/duration (ScheduleTooltip.tsx:80-81)
- open M schedule schedule.md 5: keyboard no lane change, no lead-in/out (sceneKeys.ts:188-231) - maybe wish
- open S schedule schedule.md 7: long lane name cut with no title/tooltip (Schedule.tsx:~562)
- open S schedule schedule.md 8: no domain + subtasks far apart -> empty window (view.ts:41-58 defaultSpan centred)
- open S schedule schedule.md 9: drop reports id from drag start (sceneGestures.ts:834)
- open S calculation calc.md 2: long unbreakable labels overlap figure; long unit cut at 320/375 (Calculation.module.css:233-243,334-339)
- open S calculation calc.md 7: ten levels at 375 px, indent uncapped (Calculation.module.css:239)
- open S calculation calc.md 8: reason badge names only first missing given (evaluate.ts:19,116)
- open M print calc.md 9: no print stylesheet - roadmap P3 FEATURE
- open S calculation calc.md 10: copying a row copies hidden sentence; triple-click toggles (no user-select)
- open S dashboard dashboard.md 4: onDraftChange(false) never fires on unmount (useDashboard.ts:136,146)
- open S dashboard dashboard.md 9: focus to body after Edit/Done; no arrow hint; ArrowUp/Down move one place not one row (Dashboard.tsx:184,266-278)
- unclear charts reports-bi 7: waterfall at 375 drops category labels (layout.ts:586-621 thinning)

## 10-24 cross-package files: open/unclear
- open M table/core/schedule composed-app 3: numeric backend ids need String() (rowKey => string; Combobox T extends string) - DECISION (type design)
- open S table composed-app 7: selection.count counts gone rows (= this run #3)
- open S dashboard composed-app 9: Edit button far right past 1560 px board (dashboard.module.css:133 caps .grid only; .bar full width)
- open S dashboard composed-app 12: WidgetType requires defaultOptions even when none (WidgetType.tsx:35)
- open M table audit-family 2: virtual grid under live re-sort drops focus to body (virtualBody.tsx:56-94) (= this run #27 part)
- open M table audit-family 6: sort and select-all silent; no aria-colcount; no Ctrl+A / Shift+Space in grid (gridKeys.ts:146-158)
- open S-M dashboard audit-family 7: focus to body after Reset/Cancel/Done/Edit (Dashboard.tsx:158,266-279); size menuitem "✓ " in name not menuitemradio (core wording.ts:1102); Escape does not leave edit mode; same-name Figure landmarks
- open L print operator-screens 5: no print stylesheet - roadmap P3 FEATURE, not bug
- open S charts/schedule upgrade 2: changed initialView after mount ignored silently (useChart.tsx:125) - issue 18 excluded the warning -> decided? 
- open S core upgrade 4: React 18 via legacy-peer-deps white screen, no check (low)
- open S charts cross-package 11: generic wrappers field-name note missing in charts docs
- open S table kiosk 2: docs do not point shells (Electron) to onExport
- open S table agent-docs 1: Provider page imports UmrissProvider from @umriss-ui/table (llms-full:1606, demo/outline.ts:92)
- open M all agent-docs 3: one big llms-full.md, scenarios first
- open S all agent-docs 2,6: llms.txt scenario links share index.md, no ## Optional
- open S core agent-docs 5: core scenarios import charts/table without install note (llms-full:59-60,1636)
- open S all agent-docs 7: everyday words missing in llms.txt
- unclear charts composed-app 11: Show all collides with tooltip when zoomed
- unclear charts cross-package 14: one document listener left after 60 mounts
- unclear core mobile-touch 3: Popover with focused input not kept above on-screen keyboard (device only)
- note: .scratch/touch-scale-opt-in delivered but status line still ready-for-agent

## 10-28 personas: open/unclear (rest fixed or decided)
- open S dashboard p4-jonas 5: two widgets of one type both named "Actions for Figure" (Dashboard.tsx:199, WidgetType.ts:68 titleOf falls back to type label)
- open S table p1-lena 9a: table without aria-label/labelledby has no name and no DEV warning
- open S alarms p6-6: at 375 px Priority column off-screen (AlarmList.tsx:590 third column)
- unclear schedule p1-lena 3b: wrong-typed `domain` crashes raw (no check; scene.ts:195)
- unclear schedule p1-lena 9b: two lanes under ~250 px high -> empty plot at 375
- unclear table p1-lena 9c: Date column default "04/03/2024, 00:00", numbers unformatted by default (maybe intended)
- wish alarms p6-3: banner too quiet across a room (annunciator variant) - not a defect

## Settled in Chromium
CONFIRMED: 1 schedule wrong-typed domain/object subtasks -> raw crash, whole tree unmounts (instant.getTime is not a function; layer.data is not iterable)
NOT: 2a two lanes 375 empty plot (only <150 high cuts lane 2)  NOT: 2b 165px plot
CONFIRMED: 2c lane gutter 40% at 375/320 (maybe deliberate)
CONFIRMED: 3 table Date column default "04/03/2024, 00:00" (time at midnight), numbers all decimals "1,234,567.891"
CONFIRMED minor: 4 chart Show all covered by tooltip near it; stray empty tooltip stub when hovering button
NOT: 5 chart document listener leak
CONFIRMED: 6 waterfall 375: 3 of 7 labels dropped
CONFIRMED: 7 radio draws as rounded square: ownStyles adds corner-shape squircle; RadioGroup.module.css lacks corner-shape: round (Badge, Stepper, DataViz set it)
NOT: 8 checkbox+switch overlap (touch, 4px vertical offset)
NOT: 9a checkbox/switch/fileinput blue ring
CONFIRMED: 9b skip link browser blue ring
CONFIRMED: 9c table sort-header focus ring clipped (inset box-shadow inside overflow scroll box)
CONFIRMED: 10 Popover follows anchor out of a clipping container, drawn over the page
CONFIRMED: 11 stacked FormFields 0 px gap, error touches next label
CONFIRMED: 12a Select panel 8px narrower (4 per side); 12b Splitter faint 1px hairline at rest; 12c Drawer full screen at 375 (maybe fine)
CONFIRMED: 13a Modal without autoFocus focuses Close; 13b NumberInput unit not in accessible name
PARTLY: 14a axe region only for role-less Popover; 14b landmark-unique for two same-named landmarks (app's)
CONFIRMED: 15 dashboard widget title truncated under 1.4.12 text spacing, no title attr

