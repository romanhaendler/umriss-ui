# 10: The alarm list's state and duration cells are styled apart

**What to build:** A change to the state column can no longer move the duration: each cell has a class of its own - the duration `nowrap` at its cell's end, the state inline-flex with its ellipsis and cap. The state's ellipsis is proven in a browser at a narrow width with a long third-language state. Spec: `../spec.md` ("Alarm cells").

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] `small-looks.spec` (browser) green, including a narrow list with a long state: ellipsis and full text as title
- [ ] Duration stays end-aligned (screenshot of `alarmlist--show-the-alerts` unchanged)
- [ ] Core's stylesheets test green
