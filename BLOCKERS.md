# Blockers

No unresolved blockers. The project builds successfully and all core features are implemented.

## Known Limitations (non-blocking)

- **Email service**: No email verification or password reset flow (requires a transactional email service). Future improvement.
- **Rate limiting**: In-memory (resets on server restart). For production, migrate to a Redis-based solution.
- **Cloudinary upload**: Configured for unsigned uploads via upload preset. For production, consider signed uploads with backend authentication.
- **Analytics depth**: Anonymous counts only — no referrer tracking beyond what the browser sends, no geographic data, no user agent.
- **Form submissions**: No email notifications (no email service configured). Submissions are viewable in the dashboard only.
