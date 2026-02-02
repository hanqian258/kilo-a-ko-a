## 2025-05-23 - Icon-Only Button Accessibility
**Learning:** Icon-only buttons (like Edit/Delete/Close actions) in admin interfaces were consistently missing accessible labels (`aria-label`) and tooltips (`title`). This makes critical management features invisible to screen reader users and confusing for mouse users who rely on tooltips.
**Action:** When creating any button with only an icon (e.g., `<Edit2 />`), ALWAYS add `aria-label="Action Name"` and `title="Action Name"`. Enforce this in code review for all new admin components.
