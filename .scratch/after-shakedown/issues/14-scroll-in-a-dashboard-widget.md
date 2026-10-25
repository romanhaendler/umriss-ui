# Scroll in a dashboard widget

Type:   grilling
Status: claimed

## Question

May a widget's content scroll inside its fixed height, also while the dashboard is being arranged?

ADR-0064: "the height follows the size, never the content". The documented `height: 100%` recipe holds for a
chart. A scroll box fails: outside edit mode it scrolls, but in edit mode the widget body is `inert`, so a
reader cannot look through a table widget's rows while deciding where it goes
(`.scratch/shakedown/dashboard.md`, "Content that scrolls in its widget"). A chart with `height={260}` in a
three-row widget loses 132 px with no axis and no scroll (`dashboard.md`).

- Keep wheel and touch scroll alive in edit mode (not `inert` for scrolling, yet nothing in it starts a drag),
  or show the size's cut line, or neither.
- Does ADR-0064 change in a sentence (content may scroll within the size), or does the recipe change?
- What tells an author that content is cut (a DEV warning, the size label)?
