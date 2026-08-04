---
name: rishiverse-api-layer-review
description: >-
  Reviews module code against RishiVerse layered API rules (no Prisma in
  controllers, no res.json in services, Zod in controllers, soft-delete, file
  placement). Use when reviewing a PR, auditing a module, or checking handoff
  readiness.
---

# RishiVerse API layer review

## When to use

PR review, pre-handoff audit, or “does this follow our pattern?” questions.

## Checklist

Walk the changed module and report **pass / fail** per item with file references.

### Structure

- [ ] Validators under `validators/{module}/` (not legacy `utils/validators/`)
- [ ] Constants under `constants/{module}Constant.js`
- [ ] DAL / service / controller / routes present and named correctly
- [ ] Module aggregator mounts kebab entity routes
- [ ] `app.js` (or notes) shows `/api/v1/{module}` mount

### Layer boundaries

- [ ] No `prisma` / `@prisma/client` imports outside `dals/` (and prisma client module)
- [ ] No `res.json` / `res.status` / `req` in `services/` or `dals/`
- [ ] Controllers call `schema.parse(req.body|req.query)`
- [ ] Controllers use `handleControllerErrorResponse` in `catch`
- [ ] Services return `{ success, message, statusCode, ... }` and throw only on unexpected errors

### Data & HTTP

- [ ] Soft-delete: writes set `deletedAt`; reads filter `deletedAt: null`
- [ ] List endpoints return `pagination` when applicable
- [ ] Success/failure envelopes match [DESIGN.md](../../DESIGN.md)
- [ ] URL verbs match `/new`, `/all`, `/:id`

### Safety

- [ ] No secrets in diff
- [ ] No unjustified new heavy dependencies
- [ ] No redefinition of core Student/User schemas

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
