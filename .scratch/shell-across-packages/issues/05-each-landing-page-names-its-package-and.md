# 05: Each landing page names its package and where to start

Status: done
Blocked by: 01 (One list of packages, one theme for the whole site), `facade-defects` 03 (One install command, derived from the manifest)
Spec: `.scratch/shell-across-packages/spec.md`

**What to build:** The scenarios page of each demo keeps its address; its eyebrow becomes "Scenarios", its heading the npm name (`@umriss-ui/table`), then the package's sentence. Below it: the install command as a copyable block from the one install-command function, and one link "Start with <page name> →" to the start page from the package list.

- [x] Each of the five landing pages is headed by its npm name, in the app and in the prerendered HTML.
- [x] Each shows the derived install command; its copy button puts exactly that command on the clipboard (page suite).
- [x] Each "Start with" link leads to an existing page of its demo.
- [x] The landing screenshot baselines are renewed.

## Comments

**Delivered.** The scenarios page's head (`packages/demo/src/Scenarios.tsx`) has the eyebrow "Scenarios", the npm name as `h1` (`demo.packageName`), the landing sentence, the install command as the `InstallLine` the Installation page uses (now exported from `Page.tsx`, with the same `CopyButton` and `demo.install`), and one link "Start with <page name> →" to the start page that `PACKAGES` names, resolved against the demo's own pages. `Scenarios` no longer takes `brand`; the Shell keeps its `brand` prop for ticket 02. The prerendered landing (`tooling/llms.ts`) matches: `h1` with the npm name, the command as an `sh` block (it used to be an inline "Install with …" sentence), and the same start link as an absolute address. `llms.txt` and `llms-full.txt` are unchanged.

**Tests.** `llms.test.ts`: the front page's HTML opens with the npm name as `h1` and carries the command as `<pre><code class="language-sh">` and the start link. The fixture joins the package list through `vi.mock`, starting at Meter. Page suite (`checkInstall` in `packages/demo/checks/page.ts`, all five demos): a new test opens the landing, checks the `h1`, checks that the copy button puts exactly the command on the clipboard, and follows "Start with …" to the page the list names, whose `h1` must show that page's name. It passed in the five light projects. After the rebase, the shell and page suites ran in ui-light and table-light (the narrowed rule).

**Baselines moved.** `page-scenarios-*` in all five demos, light and dark (10 images): the landing's page head, where this ticket changes it. Nothing else moved.

**Deviations.** None. The start link reads the ids in `PACKAGES` as they stand (charts' `installation` after sidebar-tree 01), so later id moves only touch the list. Under the machine's load (average 50–130) the demo smoke tests of core and table time out at 5 s. With `--testTimeout=30000` they pass, so the cause is load, not this change.
