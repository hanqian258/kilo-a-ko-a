## 2026-01-29 - Stored XSS in CMS
**Vulnerability:** Unsanitized usage of `dangerouslySetInnerHTML` with user-supplied content in `AwarenessView`.
**Learning:** The project uses `react-simple-wysiwyg` which does not auto-sanitize, and the codebase lacked sanitization libraries like `dompurify`. Also, the codebase had broken imports preventing build, which hindered security verification.
**Prevention:** Always use `dompurify` or similar when using `dangerouslySetInnerHTML`. Ensure CI pipelines enforce build stability.

## 2026-02-12 - Hardcoded Admin Backdoor
**Vulnerability:** A hardcoded fallback `CORAL2026` was used in `RoleVerificationModal` when `VITE_ADMIN_CODE` was missing, allowing unauthorized admin access.
**Learning:** Fallbacks for security-sensitive configurations can become backdoors if the primary configuration is missing.
**Prevention:** Enforce mandatory environment variables for security credentials and fail securely (deny access) if they are missing.
