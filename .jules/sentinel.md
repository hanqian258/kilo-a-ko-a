## 2026-01-29 - Stored XSS in CMS
**Vulnerability:** Unsanitized usage of `dangerouslySetInnerHTML` with user-supplied content in `AwarenessView`.
**Learning:** The project uses `react-simple-wysiwyg` which does not auto-sanitize, and the codebase lacked sanitization libraries like `dompurify`. Also, the codebase had broken imports preventing build, which hindered security verification.
**Prevention:** Always use `dompurify` or similar when using `dangerouslySetInnerHTML`. Ensure CI pipelines enforce build stability.

## 2026-02-07 - CSV Injection (Formula Injection)
**Vulnerability:** The `escapeCsvField` utility failed to neutralize strings starting with `=`, `+`, `-`, or `@`. This could allow attackers to inject malicious formulas into exported CSV files (Survey responses or Gallery data), leading to code execution or data exfiltration when opened in spreadsheet software like Excel.
**Learning:** Standard CSV escaping (handling quotes and commas) is insufficient for security. Spreadsheet software interprets specific leading characters as formulas even in CSVs.
**Prevention:** Always prepend a single quote `'` to fields starting with `=`, `+`, `-`, or `@` before applying standard CSV escaping. This forces the spreadsheet to treat the content as text.
