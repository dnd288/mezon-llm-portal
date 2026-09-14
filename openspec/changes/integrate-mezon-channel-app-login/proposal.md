# Proposal: Integrate Mezon Channel App login

## Context

Issue #10 requests login through Mezon Channel App user credentials. Mezon Channel App opens the portal with signed hash-based auth data in the URL query parameter `data`, avoiding the OAuth redirect round trip for users already inside Mezon.

Current portal auth is Mezon OAuth 2.0 → new-api user sync → signed JWT `session` cookie. This change adds a second Mezon identity entry point while keeping the same new-api sync and portal session model.

Requirements: FR-1, FR-7, NFR-2, NFR-4. Open question OQ4 shapes OAuth state hardening, but this change does not build on OAuth state; Channel App hash verification is independent and server-side.

## Goals

- Accept Mezon Channel App signed auth payloads from `?data=...`.
- Verify the payload server-side using Mezon's MD5 + HMAC-SHA256 algorithm and `MEZON_APP_SECRET`.
- Reject missing, malformed, stale, or signature-invalid payloads.
- Reuse the existing new-api identity sync and backend credential minting path.
- Issue the existing httpOnly `session` cookie and land authenticated users on `/dashboard`.
- Document the new flow and failure modes.

## Non-goals

- Replace OAuth login.
- Store Channel App payloads or Mezon app secrets client-side.
- Add backend/new-api migrations or Go code.
- Add new protected-route semantics.

## Expected changes

- Add a server endpoint under `src/app/api/auth/` for Channel App auth.
- Add a small client leaf for login-page auto-submit when `data` is present.
- Extract shared user-sync logic from the OAuth callback so OAuth and Channel App use one implementation.
- Add unit coverage for hash validation and route/user-sync behavior where practical.
- Extend auth docs and e2e flow coverage.
