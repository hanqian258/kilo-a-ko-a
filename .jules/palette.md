## 2024-05-22 - Icon-Only Button Accessibility
**Learning:** Icon-only buttons (like Edit/Delete) in lists often lack context for screen readers. A generic "Edit" label isn't enough when there are multiple edit buttons on the page.
**Action:** Always include dynamic `aria-label`s (e.g., "Edit [Item Name]") and `title` tooltips for icon-only buttons to ensure context and usability.
