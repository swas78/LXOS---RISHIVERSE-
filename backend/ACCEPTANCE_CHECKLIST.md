# Acceptance checklist (before handoff)

Your module is ready for RishiVerse integration when **all** apply:

## Structure

- [ ] Prisma model under `prisma/models/{module}/`
- [ ] Constants in `constants/{module}Constant.js`
- [ ] Zod schemas in `validators/{module}/{entity}Schema.js`
- [ ] DAL in `dals/{module}/{entity}Dal.js` (Prisma only, soft-delete)
- [ ] Service in `services/{module}/{entity}Service.js` (result objects, no `res`)
- [ ] Controller in `controllers/{module}/{entity}Controller.js` (`schema.parse`, `handleControllerErrorResponse`)
- [ ] Entity routes + module aggregator routes
- [ ] Mount documented for `app.js` / `authRouter` (`/api/v1/{module}`)

## Quality

- [ ] No Prisma imports outside `dals/`
- [ ] No `res.json` / Express `req`/`res` in services or DALs
- [ ] Validators are Zod (not Express middleware)
- [ ] Soft-delete conventions followed
- [ ] No `.env`, keys, or credentials committed
- [ ] Sample curl/Postman collection for happy path + validation error

## Handoff package

- [ ] Git tag (e.g. `inventory-v1.0.0`)
- [ ] List of new env vars (names only, no values)
- [ ] List of Prisma models / enums added
- [ ] Permissions you expect (model + actions), if any
- [ ] Dependencies beyond Express/Prisma/Zod (justify each)
- [ ] Short README section: what the module does + endpoint table

Maintainers will copy folders into `RishiVerse-Backend`, open an internal PR, review against this checklist, then migrate and deploy.
