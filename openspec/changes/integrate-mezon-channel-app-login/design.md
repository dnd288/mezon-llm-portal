# Design: Mezon Channel App login

## Decision

Add Channel App login as a second Mezon identity entry point, then converge immediately into the existing portal session model:

`Channel App payload → server hash verification → shared new-api user sync → backend login → existing session cookie`.

This avoids a second auth system and keeps protected routes, Server Components, and `/api/portal/*` unchanged.

## Security model

- The browser only forwards the opaque Channel App payload to the Next server.
- `MEZON_APP_SECRET` is read only in the server route/helper.
- The endpoint compares computed and received hashes with timing-safe equality.
- Payload freshness is enforced from `auth_date`; stale signed URLs cannot mint new sessions indefinitely.
- No Channel App raw payload is logged or returned.
- No new-api admin token, backend token, or JWT secret crosses the browser boundary.

## Shared identity sync

OAuth callback currently owns the new-api sync steps inline. Channel App auth needs the same behavior after identity verification, so this change extracts a plain server helper that accepts normalized Mezon identity fields:

```ts
syncMezonUserSession({ mezonUserId, username, accessToken })
```

The helper:

1. Builds backend username candidates with `getBackendUsernameCandidates`.
2. Searches/adopts an exact active non-admin new-api user.
3. Creates a new-api user on miss.
4. Re-syncs the deterministic password.
5. Calls `loginUser` to mint the backend token.
6. Returns `SessionPayloadBase` for `createSession`.

For Channel App login, there is no OAuth access token. The session `accessToken` claim remains present for compatibility and stores a bounded non-secret marker derived from the verified Channel App payload source. All new-api calls use `backendAccessToken`, so protected portal behavior is unchanged.

## Failure handling

Browser auto-submit failures land back on `/login?error=channel_app_auth_failed`. Direct API failures return JSON with 400/401/500 status depending on classification.

## Alternatives rejected

- **Make Channel App call OAuth anyway**: preserves current code but defeats the issue's purpose.
- **Store Channel App token in localStorage**: conflicts with the existing httpOnly cookie model and exposes auth material to the browser.
- **Duplicate OAuth callback sync logic**: creates two account-linking implementations; future changes would drift.
