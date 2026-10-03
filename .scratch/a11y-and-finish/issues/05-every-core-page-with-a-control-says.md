# 05: Every core page with a control says its keys

Status: ready-for-agent
Blocked by: 02 (The silent-page check, with charts and calculation filled)
Spec: `.scratch/a11y-and-finish/spec.md`

**What to build:** The check wired into the core demo. Pages with a tabbable stage and no Keyboard section — among them Button, Input, Textarea, Card, Alert, Toast, Typography, Stepper — get their native keys as own rows; Toast, Alert, Spinner, ProgressBar, Meter, Stat and Skeleton get Accessibility sections for what they announce or expose.

- [ ] The check passes on all core pages, exceptions reasoned
- [ ] Every core page that announces something has an Accessibility section
- [ ] Screenshot baselines renewed for the pages that gained sections
