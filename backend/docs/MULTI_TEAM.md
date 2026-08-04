# Multi-team / outsourcing model

This repository is the **shared scaffold for all external teams**. Keep one kit; do not fork a separate standards repo per vendor unless isolation requires it.

## Why one scaffold

| Benefit | Detail |
|---------|--------|
| One source of truth | Same `ARCHITECTURE` / `DESIGN` / `RULES` / skills for every vendor |
| Easier reviews | Maintainers always know the layout |
| Cheaper onboarding | Invite → clone → copy `demo/item` |
| Controlled upgrades | When RishiVerse patterns change, update this kit once |

## Recommended operating model

```text
                    rishiverse-module-scaffold (private)
                    ┌─────────────────────────────────┐
   Team A ─────────►│  standards + demo/item           │
   Team B ─────────►│  each team owns only their       │
   Team C ─────────►│  module folders / branches       │
                    └──────────────┬──────────────────┘
                                   │ tagged handoff
                                   ▼
                         RishiVerse-Backend (core)
```

### Access

1. Keep the repo **private** under `Rishihood-University`.
2. Invite each outsourcing team as **Collaborators** (or a GitHub Team per vendor) with **write** only here — **not** on full `RishiVerse-Backend` unless you deliberately choose otherwise.
3. Core maintainers remain admins.

### Branch naming (avoid collisions)

| Team work | Branch pattern |
|-----------|----------------|
| Feature | `feature/<vendor>-<module>-<short-desc>` |
| Release tag | `<module>-vX.Y.Z` (module name should be globally unique) |

Examples: `feature/acme-inventory-crud`, tag `inventory-v1.0.0`.

### Module ownership

- Each vendor picks a **unique `{module}`** slug (`inventory`, `mess-kiosk`, …) — claim it with maintainers first.
- Do **not** edit another team’s module folders or `demo/` behaviour (demo is shared sample only).
- Do **not** change root kit docs/rules/skills unless a maintainer asks (those are org standards).

### Isolation options (when needed)

| Situation | Approach |
|-----------|----------|
| Normal multi-vendor | Shared kit (this repo) + strict module folder ownership |
| Strong IP / NDA separation | Vendor forks this kit **or** gets a private copy repo seeded from this scaffold; standards still sync from here |
| Temporary contractor | Read access to kit + PR-only via fork |

Prefer **shared kit + module boundaries** first. Split repos only when legal/IP requires it.

### What stays in the kit vs what leaves

**Stays / evolves here:** `ARCHITECTURE.md`, `DESIGN.md`, `RULES.md`, `.cursor/rules`, `.cursor/skills`, `demo/item`, acceptance checklist.

**Leaves via handoff:** only that team’s `routes|controllers|services|dals|validators|constants|prisma/models/{module}/`.

### Maintainer cadence

1. Onboard team → invite + point at README + `demo/item`.
2. Kickoff → reserve `{module}` name.
3. During build → PRs in this repo; use skill `rishiverse-api-layer-review`.
4. Handoff → tag + checklist; copy into `RishiVerse-Backend`.
5. Periodically → bump kit docs when core patterns change; notify vendors.

## Do not

- Give every vendor full `RishiVerse-Backend` clone “for convenience”
- Let vendors rewrite kit standards in conflicting ways on `main` without review
- Reuse the same `{module}` name across two vendors
