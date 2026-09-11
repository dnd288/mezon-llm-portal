---
name: openspec-flow
description: "End-to-end workflow: GitHub issue → OpenSpec propose → implement → PR → report. Use when the user wants to go from idea to merged PR in one coordinated flow, synced with GitHub Issues."
allowed-tools: Bash(openspec:*), Bash(gh:*)
license: MIT
compatibility: Requires openspec CLI and gh CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.12.0"
---

End-to-end development flow synced with GitHub Issues.

```
idea → GitHub issue → openspec-propose → update issue → openspec-apply-change → implement → PR → report
```

**Input**: The argument after invoking this skill is either:
- A description of what to build (starts the full flow)
- A GitHub issue number like `#12` (picks up from an existing issue)
- A change name to resume an in-progress flow

**Store selection:** If the user names a store (a standalone OpenSpec repo registered on this machine), run `openspec store list --json` to discover registered store ids, then pass `--store <id>` on commands that accept it. Once selected, treat `--store <id>` as sticky for the rest of the workflow.

---

## Steps

### Phase 1: Capture — GitHub Issue

1. **If a description is provided** (no existing issue):

   Derive a kebab-case change name from the description.

   Create a GitHub issue:
   ```bash
   gh issue create \
     --title "<type>(scope): short summary" \
     --body "$(cat <<'EOF'
   ## Context

   <what and why — from the user's description>

   ## Acceptance Criteria

   - [ ] <criterion 1>
   - [ ] <criterion 2>

   ## OpenSpec

   - Change: `<change-name>`
   - Schema: `<cross-cutting or bugfix>`
   - Status: 🟡 Proposing
   EOF
   )" \
     --label "<type>"
   ```

   Record the issue number.

2. **If an issue number is provided** (`#12`):

   Read the issue:
   ```bash
   gh issue view <number> --json title,body,labels,state
   ```
   Extract the context and acceptance criteria. Derive a change name if not already noted.

3. **Determine the schema**:
   - Labels containing `bug` or description mentioning defect/fix → `--schema bugfix`
   - Everything else → default schema (omit `--schema`)

### Phase 2: Propose — OpenSpec Artifacts

4. **Create the OpenSpec change**:
   ```bash
   OPENSPEC_TELEMETRY=0 openspec change new "<change-name>" [--schema bugfix]
   ```

5. **Run the propose flow** — follow the same steps as the `openspec-propose` skill:
   - Get status, read artifact instructions, create each artifact in dependency order
   - Ground the proposal in the GitHub issue's context and acceptance criteria
   - The acceptance criteria from the issue become the scenarios in specs
   - **Inspect the relevant project before drafting**: Read context and rules first, then
     inspect relevant implementation, nearby tests, configuration, and documentation.
     Ground scope, approach, and tasks in what you find.

6. **Update the GitHub issue** with the proposal summary:
   ```bash
   gh issue comment <number> --body "$(cat <<'EOF'
   ## OpenSpec Proposal Created

   **Change:** `<change-name>`
   **Schema:** `<schema>`

   ### Capabilities
   <from proposal.md>

   ### Key Decisions
   <from design.md, if any>

   ### Tasks
   <task list summary from tasks.md>

   **Status:** 🟢 Ready for implementation
   Run `openspec-flow <change-name>` to continue.
   EOF
   )"
   ```

7. **Show summary and pause** — wait for user to review artifacts before implementing.

### Phase 3: Apply — Implementation

8. **Create a feature branch**:
   ```bash
   git checkout -b feature/<change-name> main
   ```
   For bugfix schema:
   ```bash
   git checkout -b fix/<change-name> main
   ```

9. **Run the apply flow** — follow the same steps as the `openspec-apply-change` skill:
   - Read context files, get apply instructions
   - Implement tasks in order, mark checkboxes
   - First task is always the failing test (or flow scenario)

10. **After all tasks complete**, fill `verification.md`:
    - RED output (before)
    - GREEN output (after)
    - What ran: `bun run validate` (typecheck + lint), `bun run build` for build-sensitive changes
    - Gaps (e.g., no test suite yet per OQ1)

### Phase 4: Deliver — PR + Report

11. **Run the full validation**:
    ```bash
    bun run validate
    ```
    For build-sensitive changes:
    ```bash
    bun run build
    ```

12. **Create the pull request**:
    ```bash
    gh pr create \
      --title "<type>(scope): <summary>" \
      --body "$(cat <<'EOF'
    ## Summary

    <what changed and why — from proposal.md>

    Closes #<issue-number>

    ## OpenSpec Change

    - Change: `<change-name>`
    - Schema: `<schema>`

    ## Verification

    <summary from verification.md>

    ## Checklist

    - [x] `bun run validate` passed (typecheck + lint)
    - [x] `bun run build` clean (if applicable)
    - [x] OpenSpec artifacts complete
    - [x] Acceptance criteria satisfied
    EOF
    )"
    ```

13. **Update the GitHub issue** with completion report:
    ```bash
    gh issue comment <number> --body "$(cat <<'EOF'
    ## Implementation Complete

    **PR:** #<pr-number>
    **Branch:** `<branch-name>`

    ### What was built
    <bullet summary of changes>

    ### Verification
    - Typecheck: ✅ clean
    - Lint: ✅ clean
    - Build: ✅ clean (if applicable)
    - OpenSpec: ✅ all artifacts complete

    ### Files changed
    <file list with brief description>

    **Status:** 🔵 In Review
    EOF
    )"
    ```

14. **Show final summary**:
    ```
    ## Flow Complete

    **Issue:** #<number> — <title>
    **Change:** <change-name>
    **PR:** #<pr-number>
    **Branch:** <branch>

    ### Delivered
    - OpenSpec artifacts: proposal, specs, tasks, verification
    - Implementation: <N> tasks completed
    - Tests: <N> new/modified (or "No test suite yet — OQ1")
    - PR opened and linked to issue

    The PR is ready for review. After merge, run `openspec-archive-change <change-name>`.
    ```

---

## Resuming a flow

If the user provides a change name that already exists:

1. Check `openspec status --change "<name>" --json`
2. Check if a linked GitHub issue exists (search issue body for the change name):
   ```bash
   gh issue list --search "<change-name> in:body" --json number,title,state
   ```
3. Determine where the flow left off:
   - No artifacts → resume at Phase 2 (propose)
   - Artifacts exist, tasks incomplete → resume at Phase 3 (apply)
   - Tasks complete, no PR → resume at Phase 4 (deliver)
   - PR exists → show status

---

## Guardrails

- **Always create the GitHub issue first** — it is the tracking record
- **Always update the issue** at propose completion and PR creation
- **Acceptance criteria from the issue are the source of truth** for specs
- **Do not skip verification** — `verification.md` must have actual pasted output
- **PR must reference the issue** with `Closes #<number>`
- **Branch naming follows convention** — `feature/` or `fix/` prefix
- **Validation gate** — `bun run validate` must pass before PR creation; `bun run build` for build-sensitive changes
- Ask for clarification on ambiguity that affects scope; assume minor details
- If implementation reveals scope beyond what the issue described, update the issue before proceeding
- Never expose `NEW_API_ADMIN_TOKEN`, `MEZON_CLIENT_SECRET`, or `JWT_SECRET` in issue bodies, PR descriptions, or commit messages
