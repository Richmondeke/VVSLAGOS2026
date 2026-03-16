import { loadEnv } from "@vvs/shared/config/env";
import { buildApp } from "./app.js";

const env = loadEnv();

const app = await buildApp();

try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    console.log(`VVS API listening on port ${env.PORT}`);
} catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
}
