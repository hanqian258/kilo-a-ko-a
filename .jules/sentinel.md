## 2026-01-29 - Stored XSS in CMS
**Vulnerability:** Unsanitized usage of `dangerouslySetInnerHTML` with user-supplied content in `AwarenessView`.
**Learning:** The project uses `react-simple-wysiwyg` which does not auto-sanitize, and the codebase lacked sanitization libraries like `dompurify`. Also, the codebase had broken imports preventing build, which hindered security verification.
**Prevention:** Always use `dompurify` or similar when using `dangerouslySetInnerHTML`. Ensure CI pipelines enforce build stability.
## 2026-02-18 - CSV Injection Prevention
**Vulnerability:** CSV exports in `utils/csvExport.ts` and `utils/storage.ts` were susceptible to CSV Injection (Formula Injection), allowing execution of malicious formulas in spreadsheets.
**Learning:** Standard CSV escaping (quotes) does not prevent formula execution. Specific characters (`=`, `+`, `-`, `@`) at the start of fields must be escaped by prepending a single quote (`'`).
**Prevention:** Centralized CSV escaping logic in `utils/csvExport.ts` and enforced its usage across the codebase. Added specific regex checks for injection characters.
