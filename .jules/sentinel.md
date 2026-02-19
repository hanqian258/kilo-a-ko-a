## 2026-01-29 - Stored XSS in CMS
**Vulnerability:** Unsanitized usage of `dangerouslySetInnerHTML` with user-supplied content in `AwarenessView`.
**Learning:** The project uses `react-simple-wysiwyg` which does not auto-sanitize, and the codebase lacked sanitization libraries like `dompurify`. Also, the codebase had broken imports preventing build, which hindered security verification.
**Prevention:** Always use `dompurify` or similar when using `dangerouslySetInnerHTML`. Ensure CI pipelines enforce build stability.

## 2026-02-12 - Hardcoded Admin Code
**Vulnerability:** A fallback administrative access code was hardcoded in the source code, allowing potential unauthorized access if the environment variable was missing.
**Learning:** Default values for sensitive configurations should never be hardcoded secrets. E2E tests were relying on this default.
**Prevention:** Strictly use environment variables for secrets. Ensure test environments are configured with necessary variables rather than relying on code fallbacks.
## 2026-01-29 - CSV Injection (Formula Injection)
**Vulnerability:** The CSV export function `escapeCsvField` did not sanitize fields starting with characters like `=`, `+`, `-`, `@`, `\t`, or `\r`.
**Learning:** Standard CSV quoting (wrapping in double quotes) is insufficient to prevent formula execution in spreadsheet software (Excel, Google Sheets). Fields starting with specific characters can be interpreted as formulas even if quoted, leading to potential command execution or data exfiltration.
**Prevention:** Prepend a single quote `'` to any field starting with `=`, `+`, `-`, `@`, `\t`, or `\r` to force it to be treated as a string literal. This must be done *before* applying standard CSV escaping rules.
## 2026-02-12 - Stored CSV Injection
**Vulnerability:** `utils/csvExport.ts` failed to sanitize fields starting with `=`, `+`, `-`, `@`, `\t`, `\r` (Formula Injection), allowing execution of malicious formulas in spreadsheet software.
**Learning:** Standard CSV escaping (quotes, commas) is insufficient to prevent formula injection. Fields starting with special characters must be explicitly escaped by prepending a single quote.
**Prevention:** Use a dedicated CSV library that handles injection or implement strict escaping rules for formula triggers.
