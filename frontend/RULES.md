# Rules

Hard rules for this kit. Breaking them blocks handoff into `rishiverse-frontend-v2`.

## Repository & access

1. Develop and PR **only in this kit repo**.
2. Do not expect day-to-day clone access to full `rishiverse-frontend-v2`.
3. Never commit `.env` / `.env.local` secrets.
4. This kit is **shared across outsourcing teams** — unique module/route names; don’t edit other vendors’ folders.

## Structure (non-negotiable)

5. Respect `src/` top-level order — no new top-level folders.
6. Feature files only in this order: `types` → `Api` → `Thunks` → `Slice` → `Selectors`.
7. Route folders: `page.tsx` → hooks → components → schemas → utils.
8. Component layers: `ui` → atoms → molecules → organisms; lower never imports higher.

## Data flow

9. Pages/hooks dispatch **thunks** — never import `*Api` from pages/components.
10. Shared components never import `features/`.
11. Register new reducers in `src/store/rootReducer.ts`.
12. Add endpoint constants under `src/constants/endpoints.ts`.

## UI

13. Prefer shared molecules for tables/modals; page-specific UI stays under the route.
14. Don’t fork shadcn `ui/` primitives unnecessarily — extend via composition.
15. Use `@/` imports only (no deep relative climbs across domains).

## Quality

16. `npm run lint` and `npm run type-check` must pass before handoff.
17. No leftover debug `console.log` in release tags.
18. Complete [ACCEPTANCE_CHECKLIST.md](./ACCEPTANCE_CHECKLIST.md) before asking for integration.

## Cursor / agents

19. Follow `.cursor/rules/` and `.cursor/skills/`.
20. Prefer copying `demo/item` over inventing new architecture.
