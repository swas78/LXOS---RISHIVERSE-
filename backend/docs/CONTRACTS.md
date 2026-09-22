# Shared contracts (read-only assumptions)

You may **reference** these concepts when designing relations. Do **not** redefine core tables in your PR unless maintainers ask.

If you need a column that does not exist, **request it** in handoff notes — do not invent production columns.

## Student (summary)

| Field                               | Notes                                                          |
| ----------------------------------- | -------------------------------------------------------------- |
| `enrollmentNo`                      | String PK used across the system                               |
| `firstName`, `lastName`, `fullName` | Identity                                                       |
| `emailId`, `mobileNumber`           | Contact                                                        |
| `profileStatus`                     | Onboarding-related; treat as opaque unless your module owns it |

Kit does **not** ship the full Student model.

## User

| Field               | Notes                                    |
| ------------------- | ---------------------------------------- |
| `userId`            | Int PK                                   |
| `referenceId`       | Often enrollment / employee id           |
| Roles / permissions | Enforced in core; document what you need |

## Response envelope

Success:

```json
{ "success": true, "message": "...", "data": {}, "pagination": {} }
```

Failure:

```json
{ "success": false, "message": "...", "errors": [{ "path": ["field"], "message": "..." }] }
```

## Soft delete

Most domain rows use `deletedAt DateTime?`. Filter `deletedAt: null` on reads.
