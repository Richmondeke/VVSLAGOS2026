const { chromium } = require('playwright');
const path = require('path');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  
  await page.goto("http://localhost:3000/guests");
  await page.waitForLoadState("networkidle");
  await page.waitForSelector("main");
  await page.waitForTimeout(2000);

  // Take Section 1 Screenshot
  const base_dir = "/Users/mac/.gemini/antigravity/brain/98eab98d-2b89-403f-85b5-ee72929f8cd5";
  await page.screenshot({ path: `${base_dir}/screenshot_section1.png` });
  console.log("Section 1 screenshot saved.");

  // Scroll to Edition 1
  await page.evaluate(() => {
    document.querySelector('main').scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${base_dir}/screenshot_edition1.png` });
  console.log("Edition 1 screenshot saved.");

  // Scroll to Edition 2
  await page.evaluate(() => {
    document.querySelector('main').scrollTo({ top: window.innerHeight * 2, behavior: 'smooth' });
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${base_dir}/screenshot_edition2.png` });
  console.log("Edition 2 screenshot saved.");

  // Scroll to Edition 3
  await page.evaluate(() => {
    document.querySelector('main').scrollTo({ top: window.innerHeight * 3, behavior: 'smooth' });
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${base_dir}/screenshot_edition3.png` });
  console.log("Edition 3 screenshot saved.");

  // Scroll to Edition 4
  await page.evaluate(() => {
    document.querySelector('main').scrollTo({ top: window.innerHeight * 4, behavior: 'smooth' });
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${base_dir}/screenshot_edition4.png` });
  console.log("Edition 4 screenshot saved.");

  // Scroll to Section 3 (Split)
  await page.evaluate(() => {
    document.querySelector('main').scrollTo({ top: window.innerHeight * 5, behavior: 'smooth' });
  });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${base_dir}/screenshot_section3.png` });
  console.log("Section 3 screenshot saved.");

  // Scroll to Section 4 (Designers - Start)
  await page.evaluate(() => {
    document.querySelector('main').scrollTo({ top: window.innerHeight * 6, behavior: 'smooth' });
  });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${base_dir}/screenshot_section4_start.png` });
  console.log("Section 4 start screenshot saved.");

  // Scroll to Section 4 (Designers - Mid 1)
  await page.evaluate(() => {
    document.querySelector('main').scrollTo({ top: window.innerHeight * 7, behavior: 'smooth' });
  });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${base_dir}/screenshot_section4_mid1.png` });
  console.log("Section 4 mid1 screenshot saved.");

  // Scroll to Section 4 (Designers - Mid 2)
  await page.evaluate(() => {
    document.querySelector('main').scrollTo({ top: window.innerHeight * 8, behavior: 'smooth' });
  });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${base_dir}/screenshot_section4_mid2.png` });
  console.log("Section 4 mid2 screenshot saved.");

  // Scroll to Section 4 (Designers - End)
  await page.evaluate(() => {
    document.querySelector('main').scrollTo({ top: window.innerHeight * 9, behavior: 'smooth' });
  });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${base_dir}/screenshot_section4_end.png` });
  console.log("Section 4 end screenshot saved.");

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
