import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",
    schema: ["./packages/shared/src/schema.ts", "./packages/*/src/schema.ts"],
    out: "./migrations",
    dbCredentials: {
        url: process.env.DATABASE_URL ?? "postgres://vvs:vvs_dev_password@localhost:5432/vvs_dev",
    },
});
