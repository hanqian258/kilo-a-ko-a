## 2024-05-22 - Nested Interactive Elements in Virtualized Lists
**Learning:** `GalleryView` cards use `role="button"` on the container while hosting child `<button>` elements (Edit/Delete), creating invalid HTML and potentially blocking access to child actions for screen reader users.
**Action:** In future refactors, separate the "View Details" action into a distinct, stretched-link button sibling to the "Edit/Delete" actions within a non-interactive container `div`.
