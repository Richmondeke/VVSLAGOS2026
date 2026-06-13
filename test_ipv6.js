import postgres from 'postgres';
import dns from 'dns';

// Intercept DNS lookup for the Supabase database host and return the IPv6 address
const originalLookup = dns.lookup;
dns.lookup = function(hostname, options, callback) {
    if (hostname === 'db.rdoldxaclybdlggayjnc.supabase.co') {
        let cb = callback;
        let opt = options;
        if (typeof options === 'function') {
            cb = options;
            opt = {};
        }
        
        console.log(`[DNS Mock] Resolving ${hostname} (options: ${JSON.stringify(opt)})`);
        
        if (opt.all) {
            return cb(null, [{ address: '2a05:d018:8eb:2f00:4851:a7b8:a966:bd54', family: 6 }]);
        } else {
            return cb(null, '2a05:d018:8eb:2f00:4851:a7b8:a966:bd54', 6);
        }
    }
    return originalLookup.apply(this, arguments);
};

const passwords = [
    "Rich1996?",
    "Rich1996?!",
    "Sk1d061Wh3364?",
    "Sk1d061Wh3364?1",
    "Sk1d061Wh3364?!"
];

async function testDirect() {
    console.log(`Starting intercepted DNS database connection tests...`);
    for (const password of passwords) {
        console.log(`Testing direct connection with password: ${password}...`);
        const sql = postgres({
            host: "db.rdoldxaclybdlggayjnc.supabase.co",
            port: 5432,
            user: "postgres",
            password: password,
            database: "postgres",
            idle_timeout: 3,
            connect_timeout: 5
        });

        try {
            const result = await sql`SELECT 1 as connected`;
            console.log(`\n🎉 SUCCESS! Connected directly via intercepted DNS!`);
            console.log(`Working Password: ${password}`);
            console.log(result);
            await sql.end();
            process.exit(0);
        } catch (err) {
            console.log(`❌ Failed with password ${password}:`, err.message);
            await sql.end();
        }
    }
    console.log("All passwords failed on direct connection.");
    process.exit(1);
}

testDirect();
