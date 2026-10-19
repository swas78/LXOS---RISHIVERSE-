# New frontend module checklist

```text
src/features/{domain}/{entity}/
  types.ts
  {entity}Api.ts
  {entity}Thunks.ts
  {entity}Slice.ts
  {entity}Selectors.ts

src/app/(erp)/{kebab-route}/
  page.tsx
  hooks/use{Entity}.ts
  components/...
  schemas/{entity}Schema.ts

src/constants/endpoints.ts   # add keys
src/store/index.ts            # register slice (kit); production uses rootReducer.ts
```

Optional kit-only mock API: `src/app/api/v1/...` — do not hand off unless agreed.

Start from `demo/item`.
