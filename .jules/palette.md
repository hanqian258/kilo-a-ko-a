## 2024-05-23 - Accessibility for Icon-Only Buttons
**Learning:** Icon-only buttons (like `X`, `Edit2`, `Trash2`) are critical for functionality but invisible to screen readers without explicit `aria-label` attributes.
**Action:** Always include a descriptive `aria-label` (e.g., "Close editor", "Edit event") on any button that relies solely on an icon for visual context. Use tests to enforce their presence.
