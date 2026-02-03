## 2026-01-29 - Stored XSS in CMS
**Vulnerability:** Unsanitized usage of `dangerouslySetInnerHTML` with user-supplied content in `AwarenessView`.
**Learning:** The project uses `react-simple-wysiwyg` which does not auto-sanitize, and the codebase lacked sanitization libraries like `dompurify`. Also, the codebase had broken imports preventing build, which hindered security verification.
**Prevention:** Always use `dompurify` or similar when using `dangerouslySetInnerHTML`. Ensure CI pipelines enforce build stability.

## 2026-05-22 - CSV Injection Vulnerability
**Vulnerability:** `escapeCsvField` in `utils/csvExport.ts` did not escape fields starting with `=`, `+`, `-`, `@`, allowing for Formula Injection attacks.
**Learning:** Even simple CSV export utilities need explicit protection against formula injection, not just delimiter escaping.
**Prevention:** Prepended a single quote `'` to dangerous starting characters in `escapeCsvField`.
