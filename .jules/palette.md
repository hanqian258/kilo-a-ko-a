## 2025-02-17 - Accessible Cards: Semantic Buttons vs. Clickable Divs
**Learning:** Large interactive cards (like feature previews) are often implemented as clickable `div`s with `onClick`, making them inaccessible to keyboard users. While adding `role="button"` and `tabIndex="0"` helps, replacing them with semantic `<button>` tags provides built-in keyboard support (Enter/Space) and focus management without extra event handlers.
**Action:** Default to using `<button>` for any interactive card-like element. Add `text-left` (or appropriate alignment) to counter default button centering, and ensure `type="button"` is set to prevent accidental form submission.
## 2024-05-22 - Nested Interactive Elements in Virtualized Lists
**Learning:** `GalleryView` cards use `role="button"` on the container while hosting child `<button>` elements (Edit/Delete), creating invalid HTML and potentially blocking access to child actions for screen reader users.
**Action:** In future refactors, separate the "View Details" action into a distinct, stretched-link button sibling to the "Edit/Delete" actions within a non-interactive container `div`.
# Palette's UX Journal

## 2025-05-20 - Loading States and Accessibility

**Learning:**
Users were experiencing uncertainty during async operations (like saving events or articles) due to a lack of visual feedback. Additionally, icon-only buttons (like Close, Edit, Delete) were inaccessible to screen readers.

**Action:**
1.  Always implement `isSaving` or `isLoading` states for async form submissions and pass this to the `Button` component to show a spinner and disable the button.
2.  Ensure all icon-only buttons have a descriptive `aria-label` explaining the action and the context (e.g., "Edit [Item Name]").
3.  Ensure all form inputs have associated labels using `htmlFor` and `id` to pass accessibility checks and improve click-target behavior.
## 2025-02-18 - Icon-only Buttons Lacking Context
**Learning:** Multiple views (Awareness, Events, Gallery) used icon-only buttons for critical actions (Edit, Delete) without accessible labels, relying solely on visual icons.
**Action:** Always include `aria-label` describing the specific item being acted upon (e.g., "Edit [Item Name]") for icon-only buttons.
