## 2026-02-08 - Firebase Client-Side Validation
**Learning:** The application crashes with a white screen ("invalid-api-key") if Firebase environment variables are missing, even during local development where Firebase functionality might not be needed.
**Action:** Always ensure a `.env` file exists with dummy values (but valid format) for Firebase config when running `npm run dev` or verifying frontend changes locally.
