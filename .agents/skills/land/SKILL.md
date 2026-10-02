---
name: land
description: >-
  Land requested gatha-v2 changes onto the local main bookmark using Jujutsu
  and export the updated refs to Git. Invoke only when the user has explicitly
  requested landing, not for review, preparation, passing checks, or skill
  installation.
disable-model-invocation: true
metadata:
  delta-action: land
---

# Land changes

Use this workflow only in the gatha-v2 repository. The landing destination is
the local `main` bookmark. Use Jujutsu for change and bookmark operations, and
export refs to the underlying Git repository so Git-based tools see the landed
state. Do not push, publish, or open a pull request.

The user's landing request is sufficient authorization to perform this
workflow. Do not ask for confirmation to land again.

## Preflight

1. Inspect the JJ state with `jj --no-pager status`,
   `jj --no-pager log -r 'main | @'`, and
   `jj --no-pager bookmark list`. Confirm that the local `main` bookmark exists
   and identify the exact requested changes between `main` and the working
   copy (`@`).
2. Review that change range with `jj --no-pager diff --from main --to @`.
   Preserve unrelated work. If the working copy includes unrelated changes,
   the requested range is unclear, or the bookmark is missing, stop and ask
   the user rather than including, discarding, or relocating changes by
   guesswork.
3. Check the repository's current contribution guidance and applicable
   destination requirements. At setup time, no CI workflow, branch protection,
   or documented review or contribution requirements were present. Do not run
   tests for this workflow. If a required check or approval applies at
   execution time, verify that it passed for the exact changes being landed;
   if it is pending, failing, missing, or cannot be verified, stop without
   moving `main`.

## Integrate into local main

1. If the requested change range is already an ancestor of `main`, make no
   landing change. Otherwise, if `main` is an ancestor of `@`, advance `main`
   to `@` with `jj --no-pager bookmark set main -r @`.
2. If the requested changes and `main` have diverged, create a JJ merge change
   with `jj --no-pager new main @`. Resolve conflicts automatically only when
   the intended result is clear from the surrounding code and the requested
   change. If the conflict requires a design decision or reflects a genuine
   conflict between systems, stop and ask the user. Do not use interactive
   conflict tools or discard either side.
3. Once the merge is resolved, move the local bookmark with
   `jj --no-pager bookmark set main -r @`. Do not use `--allow-backwards` or
   bypass JJ's immutability safeguards. If JJ refuses the operation, stop and
   report the blocker.
4. Export the updated refs to Git with `jj --no-pager git export`. This is
   required for non-colocated workspaces and safe to run in a colocated
   workspace.

## Verify

Confirm `main` points at the intended landed change with
`jj --no-pager log -r main`, and confirm the Git view agrees with
`git rev-parse main`. Check `jj --no-pager status` and `git status --short` to
ensure unrelated work remains intact. Do not push to any remote. If export or
verification fails, report that landing is incomplete and leave the user with
the exact blocker.
