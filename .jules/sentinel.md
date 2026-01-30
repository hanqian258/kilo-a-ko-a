## 2026-01-29 - Stored XSS in CMS
**Vulnerability:** Unsanitized usage of `dangerouslySetInnerHTML` with user-supplied content in `AwarenessView`.
**Learning:** The project uses `react-simple-wysiwyg` which does not auto-sanitize, and the codebase lacked sanitization libraries like `dompurify`. Also, the codebase had broken imports preventing build, which hindered security verification.
**Prevention:** Always use `dompurify` or similar when using `dangerouslySetInnerHTML`. Ensure CI pipelines enforce build stability.

## 2026-02-19 - Inconsistent CSV Export Logic
**Vulnerability:** CSV Injection (Formula Injection) in multiple export functions (`utils/csvExport.ts` and `utils/storage.ts`).
**Learning:** Logic for CSV generation was duplicated, with `utils/storage.ts` using unsafe ad-hoc string concatenation.
**Prevention:** Centralize all CSV escaping logic in a single utility (`escapeCsvField`) and enforce its usage.
