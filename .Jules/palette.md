## 2026-02-01 - Semantic Buttons and ARIA Labels
**Learning:** The codebase used non-semantic `div`s with `onClick` for interactive elements (banners) and missed `aria-label`s on icon-only buttons.
**Action:** Always convert interactive `div`s to `<button type="button">` and ensure `aria-label`s are present on all icon-only controls.
