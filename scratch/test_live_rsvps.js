async function run() {
  try {
    const res1 = await fetch('https://vvs-admin-peyirx420-richmondekes-projects.vercel.app/login');
    console.log('Login Page Status (Direct URL):', res1.status);
    const text1 = await res1.text();
    console.log('Login Page body:', text1.slice(0, 300));

    const res2 = await fetch('https://admin.vvslagos.com/login');
    console.log('Login Page Status (Alias):', res2.status);
    const text2 = await res2.text();
    console.log('Login Page body (Alias):', text2.slice(0, 300));
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
