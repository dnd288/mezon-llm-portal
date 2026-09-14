# Flow: Mezon Channel App login

## Primary flow

```mermaid
sequenceDiagram
  participant User
  participant Mezon as Mezon Channel App
  participant Browser
  participant Next as Next server
  participant API as new-api

  User->>Mezon: Opens portal channel app
  Mezon->>Browser: Loads /login?data=<signed payload>
  Browser->>Next: POST /api/auth/channel-app { hashData }
  Next->>Next: Verify HMAC hash and auth_date freshness
  Next->>Next: Parse Mezon user identity
  Next->>API: Search/create/adopt new-api user via admin token
  Next->>API: Login synced user to mint backend access token
  Next->>Browser: Set-Cookie session; redirect /dashboard
  Browser->>Next: GET /dashboard with session cookie
```

## Scenarios

### Scenario: valid Channel App payload signs in

Given Mezon opens the portal with a valid `data` query parameter
When the login page submits that payload to the Channel App auth endpoint
Then the server validates the payload signature and freshness
And the portal syncs the Mezon identity to new-api
And the response sets the existing httpOnly `session` cookie
And the user is redirected to `/dashboard`.

### Scenario: invalid Channel App payload is refused

Given a user submits a missing, malformed, stale, or tampered Channel App payload
When the Channel App auth endpoint handles it
Then no session cookie is issued
And the user is redirected or answered with a Channel App auth error.

### Scenario: OAuth login remains available

Given the login page has no Channel App `data` query parameter
When a user clicks the existing Mezon login button
Then the existing OAuth flow remains unchanged.

## End-to-end proof boundary

A full production Channel App launch cannot be reproduced locally without Mezon hosting the app. The local e2e slice proves the browser-facing contract by generating a Mezon-compatible signed payload with test secrets, loading `/login?data=...`, and observing the session/redirect behavior against the test backend fixtures. Unit tests prove the cryptographic verifier with valid, tampered, malformed, and stale payloads.
