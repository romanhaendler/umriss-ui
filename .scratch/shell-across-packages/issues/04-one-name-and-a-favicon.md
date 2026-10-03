# 04: One name and a favicon

Status: ready-for-agent
Blocked by: None (can start immediately)
Spec: `.scratch/shell-across-packages/spec.md`

**What to build:** "umriss-ui" wherever a visitor reads the project's name: every title, each demo's default `index.html` title ("umriss-ui – Core" …), the site's `llms.txt` heading and the README's heading. npm names stay `@umriss-ui/<package>`; internal documents keep "umriss". One SVG favicon (a "u" in an outlined rounded square, ink colour, inverted for dark tabs by a rule inside the SVG) is linked from every demo's `index.html` and so from every prerendered page.

- [ ] No visible title or heading on the site says "Umriss UI", "Umriss Charts" or a similar variant.
- [ ] The built-site guard fails when a page does not link the favicon, and passes on the built site.
- [ ] The favicon reads in light and dark tabs.
- [ ] The site's `llms.txt` and the README are headed "umriss-ui".
