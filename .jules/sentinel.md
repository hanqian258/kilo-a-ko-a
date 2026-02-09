## 2026-01-29 - Stored XSS in CMS
**Vulnerability:** Unsanitized usage of `dangerouslySetInnerHTML` with user-supplied content in `AwarenessView`.
**Learning:** The project uses `react-simple-wysiwyg` which does not auto-sanitize, and the codebase lacked sanitization libraries like `dompurify`. Also, the codebase had broken imports preventing build, which hindered security verification.
**Prevention:** Always use `dompurify` or similar when using `dangerouslySetInnerHTML`. Ensure CI pipelines enforce build stability.

## 2026-02-12 - Hardcoded Admin Code
**Vulnerability:** A fallback administrative access code was hardcoded in the source code, allowing potential unauthorized access if the environment variable was missing.
**Learning:** Default values for sensitive configurations should never be hardcoded secrets. E2E tests were relying on this default.
**Prevention:** Strictly use environment variables for secrets. Ensure test environments are configured with necessary variables rather than relying on code fallbacks.
