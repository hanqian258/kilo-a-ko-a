## 2026-01-29 - Stored XSS in CMS
**Vulnerability:** Unsanitized usage of `dangerouslySetInnerHTML` with user-supplied content in `AwarenessView`.
**Learning:** The project uses `react-simple-wysiwyg` which does not auto-sanitize, and the codebase lacked sanitization libraries like `dompurify`. Also, the codebase had broken imports preventing build, which hindered security verification.
**Prevention:** Always use `dompurify` or similar when using `dangerouslySetInnerHTML`. Ensure CI pipelines enforce build stability.

## 2026-02-04 - CSV Injection (Formula Injection)
**Vulnerability:** `escapeCsvField` only handled quoting for commas but failed to escape cells starting with `=`, `+`, `-`, or `@`, allowing formula execution in spreadsheet software.
**Learning:** Standard CSV escaping (quoting fields with commas) is insufficient for preventing Formula Injection. Spreadsheet software interprets cells starting with special characters as formulas even if they are valid CSV strings.
**Prevention:** Always prepend a single quote `'` to fields starting with `=`, `+`, `-`, or `@` to force them to be treated as strings.
