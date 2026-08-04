# Rules

Hard rules for this kit. Breaking them blocks handoff into RishiVerse.

## Repository & access

1. Develop and open PRs **only in this kit repo**.
2. Do **not** expect clone access to full `RishiVerse-Backend` for day-to-day work.
3. Never commit `.env`, API keys, tokens, or production connection strings.
4. Never push directly to RishiVerse `Master` / production.

## Architecture (non-negotiable)

5. Never skip layers: Routes → Controller → Zod → Service → DAL → Prisma.
6. Controllers must **not** import Prisma or run raw SQL.
7. Services must **not** touch `req` / `res` or call `res.json`.
8. DALs must **not** contain HTTP or business orchestration beyond persistence.
9. Validators are Zod schemas — **not** Express middleware.
10. Call `schema.parse(...)` **inside** the controller.

## File placement (new APIs)

11. Validators → `validators/{module}/{entity}Schema.js`
12. Constants → `constants/{module}Constant.js`
13. Helpers → `helper/{module}Helper.js` (only if needed)
14. Do **not** put new validators under legacy `utils/validators/`.

## Naming & URLs

15. Files: `{entity}Routes.js`, `{entity}Controller.js`, `{entity}Service.js`, `{entity}Dal.js`, `{entity}Schema.js`
16. Exports: `{action}{Entity}Controller` / `Service` / `Dal` / `Schema`
17. URLs: `/api/v1/{module}/{kebab-entity}/new|all|:id`

## Service & HTTP contracts

18. Services return `{ success, message, statusCode, data?, pagination? }`.
19. Controllers map that object to the standard success/failure JSON envelope.
20. Every controller `catch` uses `handleControllerErrorResponse(...)`.

## Data

21. Soft-delete: set `deletedAt`; filter `deletedAt: null` on reads.
22. Propose Prisma models in-repo; **do not** assume your local `db push` ships to production.
23. Do not redefine core `Student` / `User` schemas — request contract changes.

## Dependencies

24. Prefer Express + Prisma + Zod. Extra packages need justification in handoff notes.
25. No leftover `console.log` debug noise in handoff tags (logger stub is fine).

## Handoff

26. Tag a release and complete [ACCEPTANCE_CHECKLIST.md](./ACCEPTANCE_CHECKLIST.md) before asking for integration.
27. Merging in **this** repo does **not** install code into RishiVerse — maintainers copy folders.
28. This kit is shared by multiple vendors — do not edit another team’s `{module}` folders.

## Cursor / agents

29. Follow `.cursor/rules/` and project skills under `.cursor/skills/`.
30. Agents may edit schema files; they must not invent production migration history for RishiVerse.
