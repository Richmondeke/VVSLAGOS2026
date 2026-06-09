const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  
  await page.goto("http://localhost:3050/guests");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);

  console.log("=== Initial State (Section 1) ===");
  await checkMascot(page);

  // Click the Start button to trigger smooth scroll
  console.log("\nClicking the Start button...");
  await page.click('button:has-text("Start")');
  
  // Wait 3 seconds for the scroll snap and spring animations to complete
  await page.waitForTimeout(3000);

  console.log("\n=== Scrolled State (Section 2) ===");
  await checkMascot(page);

  await browser.close();
}

async function checkMascot(page) {
  try {
    const mascot = page.locator('img[alt="Merged Mascot"]');
    const count = await mascot.count();
    console.log(`Mascot element count: ${count}`);
    if (count > 0) {
      const html = await mascot.evaluate(el => el.outerHTML);
      const parentHtml = await mascot.evaluate(el => el.parentElement.outerHTML);
      const style = await mascot.evaluate(el => {
        const s = window.getComputedStyle(el);
        const ps = window.getComputedStyle(el.parentElement);
        return {
          mascotStyle: {
            transform: s.transform,
            opacity: s.opacity,
            display: s.display,
            visibility: s.visibility,
            width: s.width,
            height: s.height
          },
          parentStyle: {
            transform: ps.transform,
            opacity: ps.opacity,
            display: ps.display,
            visibility: ps.visibility,
            width: ps.width,
            height: ps.height
          }
        };
      });
      const box = await mascot.boundingBox();
      const parentBox = await mascot.locator('..').boundingBox();
      
      console.log(`Mascot parent HTML: ${parentHtml.substring(0, 200)}...`);
      console.log(`Mascot HTML: ${html}`);
      console.log("Computed Styles:", JSON.stringify(style, null, 2));
      console.log("Mascot Bounding Box:", box);
      console.log("Parent Bounding Box:", parentBox);
    }
  } catch (e) {
    console.error("Error checking mascot:", e);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
