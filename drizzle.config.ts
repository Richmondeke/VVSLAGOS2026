import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",
    schema: ["./packages/shared/src/schema.ts", "./packages/*/src/schema.ts"],
    out: "./migrations",
    dbCredentials: {
        url: process.env.DATABASE_URL ?? "postgres://vvs:vvs_dev_password@127.0.0.1:5433/vvs_dev",
    },
});
