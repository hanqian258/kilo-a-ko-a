## 2026-01-29 - Stored XSS in CMS
**Vulnerability:** Unsanitized usage of `dangerouslySetInnerHTML` with user-supplied content in `AwarenessView`.
**Learning:** The project uses `react-simple-wysiwyg` which does not auto-sanitize, and the codebase lacked sanitization libraries like `dompurify`. Also, the codebase had broken imports preventing build, which hindered security verification.
**Prevention:** Always use `dompurify` or similar when using `dangerouslySetInnerHTML`. Ensure CI pipelines enforce build stability.

## 2026-01-29 - CSV Formula Injection
**Vulnerability:** User-controlled fields exported to CSV were not escaped to prevent formula injection. Fields starting with =, +, -, @, \t, or \r could execute commands in spreadsheet software.
**Learning:** Standard CSV escaping (handling quotes and commas) is insufficient for security. Spreadsheet software interprets certain leading characters as formulas even in CSVs.
**Prevention:** Prepend a single quote ' to fields starting with dangerous characters in the CSV export utility.
