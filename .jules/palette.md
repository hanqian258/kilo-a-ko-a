## 2024-02-14 - Semantic Toggles vs. Divs
**Learning:** Replaced a `div` based toggle inside a `label` with a semantic `<button role="switch">`. The original implementation relied on click events that were not keyboard accessible and had disconnected label associations. The new implementation is fully accessible, supports keyboard navigation, and announces state correctly to screen readers.
**Action:** When implementing toggles, always use `<button role="switch">` or `<input type="checkbox">` instead of clickable divs.
