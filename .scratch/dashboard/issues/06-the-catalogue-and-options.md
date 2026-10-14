# 06: The catalogue and options

**What to build:** In the editing mode a reader opens the **Catalogue**, sees every widget type the application offers with its name, a sentence and how much room it takes, and adds one; it appears at the end, already showing something, is brought into view and announced. From any widget's menu the reader changes what it shows - its **Options** - through the form its type provides, and those changes are steps of the draft like any other. The same type can stand on the dashboard several times with different options. See `spec.md` (The catalogue, The menu).

**Blocked by:** 03

**Status:** done

- [ ] The bar has "Add widget" in the mode; it opens the catalogue in core's `Drawer`.
- [ ] The application chooses which widget types the catalogue lists, the built-in heading included or not.
- [ ] Each entry shows the type's label, its sentence, a drawn footprint of its starting size on the twelve columns, and "Add".
- [ ] "Add" appends a widget with a new unique id, the type's starting size and its default options, brings it into view and announces it with its place. It is one step of the draft.
- [ ] A widget type can declare a form for its options, receiving the current options and a function to change them, typed from the default options. The widget's menu opens it (in a popover from the menu); each change is a step of the draft and is announced.
- [ ] A type without a form shows no options entry in its menu.
- [ ] In the mode, an empty dashboard points to the catalogue.
- [ ] The hook hands out opening the catalogue as an action.
- [ ] Wording in English and German.
- [ ] Tests through the hook in jsdom: adding at the end with defaults, two widgets of one type with different options, an options change undone and cancelled, the catalogue listing only the types the application chose; a type test that a wrong options field is an error. A browser test that an added widget is brought into view.
