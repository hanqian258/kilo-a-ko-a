# Bolt's Journal - Critical Learnings

## 2024-05-22 - Lazy Loading Opportunities
**Learning:** The application uses standard `<img>` tags in list views (`AwarenessView`, `EventsView`) without `loading="lazy"`. This causes all images to be fetched immediately, even if they are off-screen.
**Action:** Apply `loading="lazy"` and `decoding="async"` to images in lists and below-the-fold content to improve initial load time and bandwidth usage. Virtualized lists (`GalleryView`) are excluded to prevent flickering.
