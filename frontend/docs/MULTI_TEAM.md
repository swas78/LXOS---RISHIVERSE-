# Multi-team / outsourcing model

This repository is the **shared frontend scaffold for all external UI teams**.

Same rules as the backend kit:

- One standards repo
- Unique module/route ownership per vendor
- Branches: `feature/<vendor>-<module>-…`
- Handoff via tagged release → maintainers copy into `rishiverse-frontend-v2`
- Split/fork only when IP/NDA requires isolation

Do **not** give every vendor full frontend-v2 access just to learn structure.

Pair with backend scaffold when the module needs APIs: `rishiverse-backend-module-scaffold`.
