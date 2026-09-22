# Demo Item API

Base: `/api/v1/demo/item`

| Method | Path       | Body / query                                                                      |
| ------ | ---------- | --------------------------------------------------------------------------------- |
| POST   | `/new`     | `{ "title": "...", "description?": "...", "status?": "DRAFT\|ACTIVE\|ARCHIVED" }` |
| GET    | `/all`     | `?search=&status=&page=1&limit=10&sortBy=createdAt&sortOrder=desc`                |
| GET    | `/:itemId` | —                                                                                 |
| PATCH  | `/:itemId` | partial fields                                                                    |
| DELETE | `/:itemId` | soft delete                                                                       |

This module is the **golden example**. Copy it for real work; do not extend it into production features inside the kit.
