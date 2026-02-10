## 2026-01-29 - Stored XSS in CMS
**Vulnerability:** Unsanitized usage of `dangerouslySetInnerHTML` with user-supplied content in `AwarenessView`.
**Learning:** The project uses `react-simple-wysiwyg` which does not auto-sanitize, and the codebase lacked sanitization libraries like `dompurify`. Also, the codebase had broken imports preventing build, which hindered security verification.
**Prevention:** Always use `dompurify` or similar when using `dangerouslySetInnerHTML`. Ensure CI pipelines enforce build stability.

## 2026-01-29 - CSV Injection in Export Features
**Vulnerability:** The `escapeCsvField` utility in `utils/csvExport.ts` failed to sanitize fields starting with `=`, `+`, `-`, `@`, `\t`, or `\r`, allowing potential Formula Injection.
**Learning:** Checking only for CSV delimiters (commas, quotes) is insufficient for security; execution contexts (like Excel) interpret specific starting characters as commands.
**Prevention:** Always prepend a single quote `'` to fields starting with dangerous characters in CSV exports to force them to be treated as text.
