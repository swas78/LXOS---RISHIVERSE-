---
name: rishiverse-frontend-layer-review
description: >-
    Reviews UI module code against RishiVerse frontend layer rules (no Api from
    pages, feature file order, endpoint constants, reducer registration, no kit
    mock APIs in handoff). Use when reviewing a PR, auditing a module, or
    checking handoff readiness.
---

# RishiVerse frontend layer review

## When to use

PR review, pre-handoff audit, or “does this follow our pattern?” questions.

## Checklist

Walk the changed module and report **pass / fail** per item with file references.

### Structure

- [ ] Feature under `src/features/...` with `types → Api → Thunks → Slice → Selectors`
- [ ] Page under `src/app/(erp)/...` with `hooks/` / `components/` / `schemas/` as needed
- [ ] Endpoints only in `src/constants/endpoints.ts`
- [ ] Reducer registered in store
- [ ] No new top-level `src/` folders

### Layer boundaries

- [ ] No `*Api` imports from `page.tsx` or presentational components
- [ ] No axios calls outside `*Api.ts`
- [ ] Thunks use `rejectWithValue(extractApiErrorMessage(...))`
- [ ] Shared/ui components do not import `features/`

### Handoff safety

- [ ] Kit-only `src/app/api/v1/...` mock routes are **not** listed as production copy paths
- [ ] No secrets in diff
- [ ] No unjustified heavy dependencies
- [ ] Does not redefine core auth/user store slices

### UX / forms

- [ ] Zod (or agreed form stack) for create/edit payloads
- [ ] Loading and error states surfaced

## Output format

```markdown
## Verdict: PASS | FAIL | PASS WITH NOTES

### Failures

- ...

### Notes

- ...

### Suggested fixes

- ...
```

Be specific: cite paths and the rule from [RULES.md](../../RULES.md).
