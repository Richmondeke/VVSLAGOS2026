const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  
  await page.goto("http://localhost:3050/guests");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  // Take screenshot as a buffer
  const buffer = await page.screenshot();

  // Analyze pixels in the page context by uploading the screenshot buffer as a base64 string
  const base64 = buffer.toString('base64');
  const results = await page.evaluate(async (base64Str) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + base64Str;
    await new Promise(resolve => img.onload = resolve);

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const width = img.width;
    const height = img.height;
    const leftPixels = ctx.getImageData(0, 0, width / 2, height).data;
    const rightPixels = ctx.getImageData(width / 2, 0, width / 2, height).data;

    // Count non-white pixels
    // A pixel is non-white if R < 255 or G < 255 or B < 255
    let leftNonWhite = 0;
    for (let i = 0; i < leftPixels.length; i += 4) {
      if (leftPixels[i] < 250 || leftPixels[i+1] < 250 || leftPixels[i+2] < 250) {
        leftNonWhite++;
      }
    }

    let rightNonWhite = 0;
    for (let i = 0; i < rightPixels.length; i += 4) {
      if (rightPixels[i] < 250 || rightPixels[i+1] < 250 || rightPixels[i+2] < 250) {
        rightNonWhite++;
      }
    }

    return {
      width,
      height,
      leftNonWhite,
      rightNonWhite
    };
  }, base64);

  console.log("Pixel Analysis Results:", results);
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
