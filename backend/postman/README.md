# Postman

`collections/lx.postman_collection.json` covers all 105 `/api/v1/lx` endpoints.

It is **generated from `routes/lx/*.js`**, so it cannot drift from the code: each
request carries the permission its route requires and the schema its body or
query is validated against. Regenerate after adding routes rather than editing
it by hand.

## Variables

| Variable   | Default                        | Notes                            |
| ---------- | ------------------------------ | -------------------------------- |
| `baseUrl`  | `http://localhost:3010/api/v1` |                                  |
| `actorRef` | `EMP0417`                      | Seeded ADMIN. **Dev shim only.** |

## At handoff

Every request sends `x-lx-actor-ref`, which is this kit's stand-in for auth.
Replace it with `Authorization: Bearer {{accessToken}}`: identity then comes
from the JWT and the header is ignored. Nothing else in the collection changes.
