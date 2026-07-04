import psycopg2

passwords = [
    "Sk1d61Wh33764?",
    "Sk1d061Wh33764?",
    "Sk1d061Wh33764?!",
    "Sk1d61Wh33764?!",
    "Sk1d061Wh3364?",
    "Sk1d061Wh3364?!",
    "Rich1996?",
    "Rich1996?!",
    "Rich1996"
]

host = "aws-0-eu-west-1.pooler.supabase.com"
ports = [6543, 5432]
user = "postgres.rdoldxaclybdlggayjnc"
database = "postgres"

def connect():
    for port in ports:
        for pwd in passwords:
            try:
                conn = psycopg2.connect(
                    host=host,
                    port=port,
                    user=user,
                    password=pwd,
                    database=database,
                    sslmode='require',
                    connect_timeout=3
                )
                print(f"🎉 Connected successfully using port {port}")
                return conn
            except Exception as e:
                pass
    return None

def run():
    conn = connect()
    if not conn:
        print("❌ Could not connect with any port/password combination.")
        return

    try:
        cur = conn.cursor()
        
        tables = ["community_members", "rsvps", "award_votes", "panel_questions", "future_labs_applications"]
        
        # Test filters
        email_patterns = ["%audit%", "%voter%", "%test%", "%test1%"]
        
        for table in tables:
            print(f"\nCleaning table: {table}")
            
            # Find and display rows first
            select_query = f"SELECT id, email FROM public.{table} WHERE " + " OR ".join([f"email LIKE '{p}'" for p in email_patterns])
            cur.execute(select_query)
            rows = cur.fetchall()
            print(f"Found {len(rows)} matching test rows in {table}:")
            for r in rows:
                print(f"  - ID: {r[0]}, Email: {r[1]}")
                
            # Delete rows
            if rows:
                delete_query = f"DELETE FROM public.{table} WHERE " + " OR ".join([f"email LIKE '{p}'" for p in email_patterns])
                cur.execute(delete_query)
                print(f"✅ Deleted {cur.rowcount} test rows from {table}.")
        
        conn.commit()
        cur.close()
        conn.close()
        print("\n🎉 Database cleanup complete!")
    except Exception as e:
        print(f"Error executing cleanup: {str(e)}")

if __name__ == '__main__':
    run()
