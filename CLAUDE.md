# Secure Delivery Rules

These rules apply to every change in this repository. Preserve the existing UI, API response shapes, database behavior, and user-visible functionality unless a security fix requires otherwise.

## 1. Secrets and Environment

- Never hardcode API keys, tokens, passwords, JWT secrets, database URLs, SMTP credentials, Cloudinary credentials, payment secrets, session secrets, or private configuration.
- Read backend secrets only through `process.env.*`.
- Never expose backend secrets in React code or API responses.
- Keep `.env`, `.env.local`, and `.env.*.local` out of Git.
- Keep `.env.example` files committed with empty values only.
- Public frontend variables must be intentionally public and must not contain secrets.

## 2. Authentication and Authorization

- Use bcrypt or an equivalent password hash with a work factor of at least 12.
- Require a strong JWT secret from the environment. Refuse startup when it is missing or weak.
- Use short JWT expiry and never add default credentials or fallback passwords.
- Validate authentication payloads on the server.
- Check authentication and role permissions on every protected operation.
- Do not put refresh tokens or private tokens in browser `localStorage`.

## 3. Rate Limits

- Login and registration: 5 requests per IP per 15 minutes.
- General API: 60 requests per IP per minute.
- Invoice/payment generation: 20 requests per minute.
- File uploads: 5 requests per minute.
- Rate-limit responses must be HTTP 429 and include `Retry-After`.

## 4. Validation and Sanitization

- Validate every request on the server with Zod or Joi.
- Validate types, required fields, lengths, ranges, enums, IDs, email addresses, and dates.
- Sanitize request body, query, params, and stored strings against NoSQL injection and XSS.
- Reject invalid input with HTTP 400 and a generic, useful message.
- Use Mongoose/ORM query APIs. Never concatenate untrusted input into database queries.

## 5. File Uploads

- Validate MIME type, extension, and file size server-side.
- Use strict allowlists and a 5 MB image limit unless a feature explicitly requires another limit.
- Never trust or reuse the original filename.
- Rename files with UUIDs and store them outside executable paths or in approved object storage.
- Handle upload errors without exposing filesystem or stack details.

## 6. HTTP and CORS

- Use Helmet, compression, HPP, cookie parsing, Mongo sanitization, XSS protection, and CORS allowlisting.
- Never use wildcard CORS in production.
- Production origins come only from environment configuration. Never allow localhost or `127.0.0.1` in production.
- Disable `X-Powered-By`.
- Keep HTTPS termination, HSTS, CSP, clickjacking protection, and reverse-proxy configuration production-ready.

## 7. Errors and Logging

- Never return stack traces, database errors, JWT errors, filesystem paths, or internal exception messages to clients.
- Return the existing response envelope and generic error messages.
- Log detailed errors server-side with timestamp, route, request ID, and authenticated user ID when available.
- Log authentication events, invoice generation, payments, uploads, warnings, and errors.
- Redact passwords, authorization headers, tokens, and other secrets.
- Sentry or an equivalent monitoring service may be enabled through environment configuration only.

## 8. Dependencies and Database

- Use the lockfile and audit dependencies after every install or upgrade.
- Resolve critical, high, and moderate vulnerabilities without forcing broken package versions.
- Review install scripts and unmaintained security-sensitive packages.
- Use least-privilege MongoDB credentials and restrict database network access.
- Maintain tested MongoDB backup and restore scripts.
- Never expose raw database errors or credentials.

## 9. Frontend Safety

- Do not use `dangerouslySetInnerHTML`, `eval`, `new Function`, or dynamic raw HTML with user content.
- Sanitize any unavoidable rendered HTML with a maintained sanitizer.
- Do not change layout, colors, functionality, routes, or API response formats for security work unless required.
- Keep user-facing rate-limit and validation messages clear without exposing internals.

## 10. Deployment Gate

Before deployment, verify:

- `.env` files are not tracked by Git.
- All production secrets are configured in the hosting platform.
- `NODE_ENV=production` and development logging are disabled.
- MongoDB is private, authenticated, backed up, and restorable.
- HTTPS is enforced at the reverse proxy or hosting platform.
- CORS contains only known HTTPS origins.
- Rate limits and security middleware are active.
- PM2 or the platform process manager is configured for restart and memory limits.
- Frontend production build succeeds.
- Backend syntax/startup and health checks succeed.
- Authentication, inventory, billing, invoices, payments, QR generation, PDF generation, settings, customers, and reports are smoke-tested.
- `npm audit` reports no unresolved vulnerabilities.
- No secrets, default credentials, stack traces, or debug endpoints remain.

## 11. AI-Specific Rules

If an AI or LLM integration is added later:

- Keep provider keys server-side only.
- Treat prompts and model output as untrusted data.
- Apply input/output limits, per-user budgets, and usage logging.
- Validate model output before rendering or storing it.
- Never render model output as raw HTML without sanitization.
