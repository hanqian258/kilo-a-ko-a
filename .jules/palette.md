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
