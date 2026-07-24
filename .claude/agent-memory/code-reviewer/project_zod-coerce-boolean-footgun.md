---
name: zod-coerce-boolean-footgun
description: z.coerce.boolean() in query schemas treats "false"/"0" as true — flagged in public-parity review, check any new boolean query param
metadata:
  type: project
---

`z.coerce.boolean()` (Zod 3.24 in server/) is `Boolean(input)` — query string
`?featured=false` or `?home=0` coerces to `true` because any non-empty string is
truthy. First introduced in `server/src/modules/products/products.schemas.ts`
(`listProductsQuerySchema.featured/home`) during the 260723 public-parity cycle.

**Why:** FE only ever sends `featured=true`/`home=true`, so nothing breaks in-app,
but the public API contract is wrong for explicit-false values.

**How to apply:** when reviewing any new boolean query param on this server, check
it uses an enum/transform (`z.enum(['true','false']).transform(...)` or
`z.literal('true').optional()`) instead of `z.coerce.boolean()`. Recommended fix
was flagged in the 260723 review; verify whether it landed before re-flagging.
