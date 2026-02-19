## 2024-05-23 - Accessible Actions in Grids
**Learning:** Icon-only buttons (Edit/Delete) in virtualized grids often get overlooked. Adding `aria-label` with dynamic context (e.g., "Edit [Item Name]") and `title` provides critical context for screen reader users and clear tooltips for mouse users.
**Action:** Audit all map/grid/list item actions for `aria-label` and `title` attributes.
