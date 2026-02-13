## 2026-01-29 - Stored XSS in CMS
**Vulnerability:** Unsanitized usage of `dangerouslySetInnerHTML` with user-supplied content in `AwarenessView`.
**Learning:** The project uses `react-simple-wysiwyg` which does not auto-sanitize, and the codebase lacked sanitization libraries like `dompurify`. Also, the codebase had broken imports preventing build, which hindered security verification.
**Prevention:** Always use `dompurify` or similar when using `dangerouslySetInnerHTML`. Ensure CI pipelines enforce build stability.

## 2026-02-12 - CSV Formula Injection Gap
**Vulnerability:** `escapeCsvField` in `utils/csvExport.ts` did not sanitize formula injection characters (`=`, `+`, `-`, `@`), exposing users to CSV Injection risks.
**Learning:** Documentation and memory indicated the protection existed, but the code proved otherwise. Always verify security controls by reading the source and writing reproduction tests.
**Prevention:** Implement specific unit tests for security edge cases (like formula injection) to ensure the implementation matches the security design.
