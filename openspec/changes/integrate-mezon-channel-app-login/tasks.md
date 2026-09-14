# Tasks

- [x] Flow barrier: Channel App login scenarios
  - Add/update `e2e/features/auth.feature` scenarios for valid and invalid Channel App payloads.
  - Skill: `spec-workflow`, `tdd`, `app-development`, `security`.
  - Proves: `bun run test:e2e e2e/features/auth.feature`.
  - Docs: N/A until implementation task.

- [x] Extract shared Mezon identity sync
  - Move OAuth callback's new-api user adoption/create/password-sync/backend-login logic into a reusable server helper.
  - Keep OAuth behavior unchanged.
  - Skill: `app-development`, `security`, `tdd`.
  - Proves: `bun run test` and existing auth e2e slice.
  - Docs: N/A.

- [x] Add Channel App hash validation
  - Implement parser/verifier for base64/raw Channel App data, HMAC-SHA256 signature, timing-safe compare, required user fields, and auth_date freshness.
  - Skill: `security`, `tdd`.
  - Proves: `bun run test src/lib/auth.test.ts` or matching auth unit test file.
  - Docs: update `docs/engineering/authentication.md`.

- [x] Add Channel App auth route and login page submitter
  - Add `src/app/api/auth/channel-app/route.ts` and a client leaf used by `/login` to submit `?data=...`.
  - Route issues the existing `session` cookie and redirects to `/dashboard` on success.
  - Skill: `app-development`, `security`, `ui-development` if the login component changes visibly.
  - Proves: auth e2e slice and unit tests.
  - Docs: update `docs/engineering/authentication.md`.

- [x] Verify and record evidence
  - Run `bun run validate`.
  - Run `bun run test` for auth logic.
  - Run `bun run test:e2e e2e/features/auth.feature` for the user-visible auth flow.
  - Update docs or record N/A.
  - Paste results into `verification.md`.
