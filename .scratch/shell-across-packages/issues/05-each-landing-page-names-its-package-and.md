# 05: Each landing page names its package and where to start

Status: ready-for-agent
Blocked by: 01 (One list of packages, one theme for the whole site), `facade-defects` 03 (One install command, derived from the manifest)
Spec: `.scratch/shell-across-packages/spec.md`

**What to build:** The scenarios page of each demo keeps its address; its eyebrow becomes "Scenarios", its heading the npm name (`@umriss-ui/table`), then the package's sentence. Below it: the install command as a copyable block from the one install-command function, and one link "Start with <page name> →" to the start page from the package list.

- [ ] Each of the five landing pages is headed by its npm name, in the app and in the prerendered HTML.
- [ ] Each shows the derived install command; its copy button puts exactly that command on the clipboard (page suite).
- [ ] Each "Start with" link leads to an existing page of its demo.
- [ ] The landing screenshot baselines are renewed.
