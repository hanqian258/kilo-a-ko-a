## 2026-01-29 - Stored XSS in CMS
**Vulnerability:** Unsanitized usage of `dangerouslySetInnerHTML` with user-supplied content in `AwarenessView`.
**Learning:** The project uses `react-simple-wysiwyg` which does not auto-sanitize, and the codebase lacked sanitization libraries like `dompurify`. Also, the codebase had broken imports preventing build, which hindered security verification.
**Prevention:** Always use `dompurify` or similar when using `dangerouslySetInnerHTML`. Ensure CI pipelines enforce build stability.

## 2026-02-14 - Hardcoded Admin Secret
**Vulnerability:** A hardcoded fallback string ('CORAL2026') in `RoleVerificationModal.tsx` allowed unauthorized admin access if the `VITE_ADMIN_CODE` environment variable was undefined.
**Learning:** Developers often add fallbacks for local development convenience, but these become backdoors in production if configuration fails. Frontend bundles expose these strings.
**Prevention:** Never provide default values for security-critical configuration in code. Implement "fail-safe" logic that disables sensitive features when configuration is missing.
