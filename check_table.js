import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rdoldxaclybdlggayjnc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkb2xkeGFjbHliZGxnZ2F5am5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNzA4OTgsImV4cCI6MjA5Njg0Njg5OH0.n5hUc0sFDOHHS-1ljPXl93wgt_Bp2Hk3VdFQ3FzCi7o";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log("Checking if 'rsvps' table exists by attempting a dry-run insert...");
    
    // We attempt an insert that will fail validation or insert mock data
    const { data, error } = await supabase
        .from('rsvps')
        .insert([
            {
                name: "Test Connection Check",
                email: "test@vvslagos.com",
                attendance: "yes",
                events: ["runway"],
                created_at: new Date().toISOString()
            }
        ])
        .select();

    if (error) {
        console.log("Result Error details:");
        console.log(error);
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
            console.log("\n❌ Table 'rsvps' does NOT exist in Supabase!");
        } else {
            console.log("\n⚠️ Table check returned error, but table might exist:", error.message);
        }
    } else {
        console.log("\n🎉 SUCCESS! Table 'rsvps' exists and we successfully inserted a test row!");
        console.log(data);
    }
}

check();
