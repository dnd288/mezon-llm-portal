# Feature PR — `pr-feature`

**When:** implementing a new capability, or substantially changing an existing one.

**Rule:** a spec PR must be merged first unless the change is small enough to review the same day without one. `mlp-spec-workflow` owns the spec-first path.

## The rules

| | |
|---|---|
| Branch | `feature/<issue>-short-description` |
| Title | `feat(scope):` — no `—` suffix; all context goes in the body |
| Issue link | `Closes #N` — this finishes the issue |
| Proof | `bun run validate`; `bun run test:all` if UI changed |
| Deep modes | Run `bun run test:all` if src/components, component library, or app path changed. For any other workspace, `bun run validate` is sufficient. |
| Labels | Every `layer:*` the change touches, plus the epic and priority from the issue |

## Template body fields

```
Closes #<N>
```

## Red flags

- **Mixed scope** — a PR that addresses more than one issue, or more than one unrelated change. One issue = one PR.
- A feature PR whose change folder was created the same day — spec was back-filled
- src/components or component library changed and no `CI labels` label applied
- Touching two layers — it is two PRs
