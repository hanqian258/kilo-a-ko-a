## 2026-01-29 - Stored XSS in CMS
**Vulnerability:** Unsanitized usage of `dangerouslySetInnerHTML` with user-supplied content in `AwarenessView`.
**Learning:** The project uses `react-simple-wysiwyg` which does not auto-sanitize, and the codebase lacked sanitization libraries like `dompurify`. Also, the codebase had broken imports preventing build, which hindered security verification.
**Prevention:** Always use `dompurify` or similar when using `dangerouslySetInnerHTML`. Ensure CI pipelines enforce build stability.

## 2026-02-05 - Hardcoded Secret Fallback
**Vulnerability:** The Admin access code was managed via environment variable but fell back to a hardcoded string ('CORAL2026') in the source code.
**Learning:** Developers often add fallbacks for local development convenience, which then become production vulnerabilities. E2E tests also relied on this fallback, creating a dependency on the insecure pattern.
**Prevention:** Fail securely by checking for the existence of the secret and disabling the feature (or throwing an error) if missing, rather than using a default. Update tests to inject the secret properly.
