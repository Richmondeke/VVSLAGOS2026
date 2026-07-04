import postgres from "postgres";

const connectionString = process.env.DIRECT_DATABASE_URL || "postgres://postgres.rdoldxaclybdlggayjnc:Sk1d61Wh33764%3F@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";

// We disable connection pre-allocation (prepare: false) which is required for Supabase connection pooler (port 6543)
export const sql = postgres(connectionString, {
    prepare: false,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10
});
