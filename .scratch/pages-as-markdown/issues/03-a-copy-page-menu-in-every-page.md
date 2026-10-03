# 03: A "Copy page" menu in every page head

Status: ready-for-agent
Blocked by: 02 (The twins in development, and a head that follows navigation)
Spec: `.scratch/pages-as-markdown/spec.md`

**What to build:** At the end of the rubric line in every page head (scenarios page included) stands core's SplitButton, small and plain. **Copy page** fetches the page's twin and puts it on the clipboard; the label turns to "Copied" or "Failed" for 1600 ms and the same word goes into a polite status region of the page head. The menu holds **View as Markdown** (the twin in a new tab), **Open in Claude** (`https://claude.ai/new?q=<prompt>`) and **Open in ChatGPT** (`https://chatgpt.com/?hints=search&q=<prompt>`), with the prompt `Read <absolute .md address> — the documentation of <Page name> in <package>@<version>. Then help me use it in my React app.` ("the scenarios" on the scenarios page), URL-encoded.

- [ ] Page suite: "Copy page" puts on the clipboard exactly the text served at the page's twin, and after an in-app jump the copied text follows the new page
- [ ] The two "Open in" items carry the expected URLs with the encoded prompt; "View as Markdown" opens the twin
- [ ] The menu opens, moves and closes with the keys of core's Menu; the status region announces "Copied"
- [ ] The button fits the page head at 390 px without moving the title
- [ ] Screenshot baselines of the page heads renewed once
