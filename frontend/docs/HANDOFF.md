# How UI code enters rishiverse-frontend-v2

```text
Build in rishiverse-frontend-module-scaffold
        ↓
PRs stay in this kit
        ↓
Tag release (e.g. inventory-ui-v1.0.0)
        ↓
Maintainers copy paths into rishiverse-frontend-v2
        ↓
Wire sidebar + permissions + real ENDPOINTS
        ↓
Internal PR → review → merge
```

## Paths typically copied

```text
src/app/(erp)/{module}/...
src/features/{taxonomy}/{module}/   # or features/erp|configuration|lms
src/constants/endpoints.ts          # only your keys (merge carefully)
src/store/rootReducer.ts            # only your reducer line (merge carefully)
```

## Maintainers also

- Add sidebar item in `src/config/sidebar/menu.ts`
- Align endpoint URLs with backend `/api/v1/...`
- Replace kit stub auth with real ERP layout guards if needed
