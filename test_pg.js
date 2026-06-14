import pg from 'pg';

const { Client } = pg;
const host = "aws-0-eu-west-1.pooler.supabase.com";
const port = 6543;
const user = "postgres.rdoldxaclybdlggayjnc";
const database = "postgres";
const passwords = [
    "Sk1d061Wh33764?",
    "Sk1d061Wh33764?!",
    "Sk1d061Wh3364?",
    "Sk1d061Wh3364?!"
];

async function testSingle(password) {
    console.log(`Testing with pg Client: password=${password}`);
    const client = new Client({
        host,
        port,
        user,
        password,
        database,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const result = await client.query('SELECT 1 as connected');
        console.log(`🎉 SUCCESS! Connected with pg Client!`);
        console.log(`Working Password: ${password}`);
        console.log(result.rows);
        await client.end();
        return true;
    } catch (err) {
        console.log(`❌ Failed: ${err.message}`);
        await client.end();
        return false;
    }
}

async function run() {
    for (const pwd of passwords) {
        const ok = await testSingle(pwd);
        if (ok) process.exit(0);
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    process.exit(1);
}

run();
