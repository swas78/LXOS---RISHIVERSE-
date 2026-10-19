# Acceptance checklist

- [ ] Feature module: `types` → `Api` → `Thunks` → `Slice` → `Selectors`
- [ ] Reducer registered in kit `src/store/index.ts` (production: `rootReducer`)
- [ ] Kit mock `src/app/api/v1/...` routes excluded from handoff copy list
- [ ] Endpoints in `constants/endpoints.ts`
- [ ] Page under `(erp)/…` with colocated `hooks/` + `components/` + `schemas/`
- [ ] Pages dispatch thunks only (no direct Api calls)
- [ ] Shared UI not importing features
- [ ] Lint + type-check + build pass
- [ ] No secrets committed
- [ ] Handoff notes: routes, sidebar entry, permissions, env vars (names only)
- [ ] Release tag e.g. `my-module-ui-v1.0.0`
