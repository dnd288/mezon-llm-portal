# Authentication delta

## ADDED Requirements

### Requirement: Channel App hash login

The portal SHALL authenticate Mezon Channel App users from a signed `data` query payload without exposing Mezon app secrets, backend admin tokens, backend access tokens, or JWT signing secrets to the browser.

#### Scenario: Valid Channel App payload creates a portal session

- **GIVEN** a Channel App opens `/login?data=<payload>` with a Mezon-signed payload containing `query_id`, `user`, `auth_date`, `signature`, and `hash`
- **WHEN** the login page submits the payload to the server auth endpoint
- **THEN** the server verifies the HMAC-SHA256 hash using `MEZON_APP_SECRET`
- **AND** verifies that `auth_date` is within the accepted freshness window
- **AND** syncs the verified Mezon user to new-api using the existing identity sync rules
- **AND** issues the existing httpOnly `session` cookie
- **AND** redirects the user to `/dashboard`

#### Scenario: Invalid Channel App payload is rejected

- **GIVEN** a Channel App auth request has no payload, a malformed base64 payload, a missing `hash`, stale `auth_date`, invalid user JSON, or a tampered signature
- **WHEN** the server auth endpoint handles the request
- **THEN** the response does not set a session cookie
- **AND** the user can retry via OAuth from `/login`

#### Scenario: OAuth login remains unchanged

- **GIVEN** a user visits `/login` without a Channel App `data` query parameter
- **WHEN** they choose the Mezon login button
- **THEN** the portal starts the existing OAuth authorization code flow with `state` verification

## MODIFIED Requirements

### Requirement: FR-1 Authentication & account provisioning

FR-1 now supports two Mezon identity entry points: OAuth authorization code login and Channel App signed hash login. Both paths SHALL converge on the same new-api account provisioning and portal session cookie behavior.
