// A Prisma config file turns OFF Prisma's implicit .env loading, so do it
// explicitly. Core does not need this line (its datasource url is injected by
// the host process) — drop it at handoff.
import "dotenv/config";

import { defineConfig } from "prisma/config";

// Mirrors RishiVerse-Backend's own prisma.config.ts so the LX module composes
// the same way in the kit as it will in core: `schema` points at the DIRECTORY,
// making prisma/schema.prisma + prisma/models/**/*.prisma one schema.
//
// Handoff is then a directory copy of `prisma/models/lx/` into core's
// `prisma/models/lx/` — no edits to core's root schema, no include list.
export default defineConfig({
    schema: "prisma",
    migrations: {
        seed: "node scripts/seed.js",
    },
});
