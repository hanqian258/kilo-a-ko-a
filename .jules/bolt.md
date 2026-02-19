## 2026-02-08 - Firebase Client-Side Validation
**Learning:** The application crashes with a white screen ("invalid-api-key") if Firebase environment variables are missing, even during local development where Firebase functionality might not be needed.
**Action:** Always ensure a `.env` file exists with dummy values (but valid format) for Firebase config when running `npm run dev` or verifying frontend changes locally.
## 2025-02-14 - Memoization of Virtualized Grids
**Learning:** Virtualized lists (like `react-window` Grids) combined with `AutoSizer` are expensive to re-render because they recalculate layout and item positioning. When these components are nested directly inside a View component that manages high-frequency state (like form inputs or hover states), they re-render on every state change, causing significant performance degradation.
**Action:** Always extract the grid/list logic into a separate, `React.memo`ized component. Ensure all props passed to this component (especially event handlers) are stable (using `useCallback`) to prevent unnecessary re-renders of the heavy grid component.
