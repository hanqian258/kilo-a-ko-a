# Bolt's Journal

## 2025-02-18 - Route-Based Code Splitting & State Routing
**Learning:** The application uses state-based routing (`useState` in `App.tsx`) instead of URL-based routing for sub-pages (except Home). This means standard performance metrics dependent on URL changes (like typical RUM tools) might misinterpret navigation as single-page interactions rather than page loads.
**Action:** When verifying lazy loading or navigation performance, rely on DOM element visibility (`wait_for_selector`) rather than URL changes (`wait_for_url`).

## 2025-02-18 - Fragile Runtime Environment
**Learning:** The application crashes with a white screen (`Firebase: Error (auth/invalid-api-key)`) if Firebase environment variables are missing, even during local development or build verification. This blocks performance profiling tools that don't inject these variables.
**Action:** Always ensure a mock `.env` or environment variables are present before running any performance benchmarks or verification scripts.
