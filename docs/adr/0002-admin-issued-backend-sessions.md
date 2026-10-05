# ADR 0002: Backend sessions issued by the admin API, not a synced password

Status: Accepted (2026-10-05)
Deciders: maintainer
Supersedes: the "deterministic sync password" parts of [ADR 0001](0001-oauth-proxy-architecture.md) decision 1 and its renewal consequence

## Context

Portal used to get a new-api access token for a Mezon user by resetting that user's new-api password to `HMAC(NEW_API_SYNC_SECRET || JWT_SECRET, mezonUserId)` on every login (`PUT /api/user/`) and signing in with it (`POST /api/user/login`). new-api added admin step-up verification: an admin password reset now answers `403 SECURITY_PROOF_REQUIRED` unless the request carries a fresh `X-Security-Proof`, which a server process cannot produce. Every login failed with `user_sync_failed`.

Portal already proves who the user is through Mezon and keeps that identity (the new-api `userId`) in its own session cookie. A password was only a way to turn that identity into a new-api token.

## Decision

new-api exposes `POST /api/user/:id/session` (admin auth). It returns a 15-minute dashboard access token for the user named in the path, reusing that user's live `portal` login session when there is one. It refuses admins, roots and disabled users. Portal calls it with `NEW_API_ADMIN_TOKEN`:

- at login, after finding or creating the user (`adminSearchUsers` / `adminCreateUser`);
- whenever `backendAccessToken` is near expiry (`refreshBackendSessionPayload`).

Portal no longer resets passwords or signs in with one. New users get a random throwaway password because new-api requires one.

## Consequences

- Login no longer touches the step-up-protected password reset, so `RequireSecurityProof` stays enabled for everything else.
- The portal session (`SESSION_MAX_AGE`, 90 days) is the only thing that decides when a user signs in again; the backend token renews silently inside it. The new-api portal login session lasts 30 days and is replaced automatically when it ends.
- `NEW_API_ADMIN_TOKEN` is also used on the backend-token renewal path, not only at login.
- Adopting a hand-created new-api account no longer replaces its password.
- `NEW_API_SYNC_SECRET` is unused.
- Revoking a user's sessions in new-api, or bumping their auth version, only lasts until the portal's next renewal. Disabling the user is the way to cut portal access.

## What would reverse this

- new-api ships a per-user delegated credential or token exchange for trusted portals: use it instead of an admin-scoped endpoint.
- The portal gains admin users: this endpoint must not serve them, so they would need a different path.
