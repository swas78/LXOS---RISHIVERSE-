# Contributing

Shared kit for all frontend outsourcing teams. See [docs/MULTI_TEAM.md](./docs/MULTI_TEAM.md).

1. Reserve a unique module/route slug with maintainers.
2. Branch: `feature/<vendor>-<module>-<short-desc>`.
3. Copy `demo/item` (app route + `features/demo/item`).
4. Keep PRs scoped to your module paths.
5. Tag release → maintainers copy into `rishiverse-frontend-v2`.

## Verify

```bash
npm run lint
npm run type-check
npm run build
```
