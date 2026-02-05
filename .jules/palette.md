## 2026-02-05 - Accessible Labels for Icon-Only Buttons
**Learning:** In complex grid layouts like `GalleryView`, icon-only buttons (like Edit/Delete) are visually clean but completely invisible to screen readers without explicit labels. Using `aria-label` that includes the item name (e.g., "Edit Pocillopora meandrina") provides crucial context that a generic "Edit" label lacks.
**Action:** Always add `aria-label` (with context variables) and `title` to icon-only buttons, and verify with a specific `getByRole('button', { name: ... })` test case.
