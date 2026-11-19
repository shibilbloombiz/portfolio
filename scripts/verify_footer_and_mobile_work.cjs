const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage();

  // 1. Verify Footer without falling shapes
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1200));

  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await new Promise((r) => setTimeout(r, 800));

  await page.screenshot({
    path: 'docs/screenshots/footer_cleaned.png',
    fullPage: false
  });
  console.log('Saved docs/screenshots/footer_cleaned.png');

  // 2. Verify Work page at mobile viewport 390px (iPhone 14)
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000/work/', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1200));

  // Check columns computed style
  const gridColumns = await page.evaluate(() => {
    const el = document.querySelector('.work-grid');
    if (!el) return null;
    return window.getComputedStyle(el).gridTemplateColumns;
  });
  console.log('Mobile (390px) computed gridTemplateColumns:', gridColumns);

  // Scroll down a bit to see the grid clearly
  await page.evaluate(() => {
    const el = document.querySelector('.work-grid');
    if (el) el.scrollIntoView();
  });
  await new Promise((r) => setTimeout(r, 800));

  await page.screenshot({
    path: 'docs/screenshots/work_mobile_2inrow.png',
    fullPage: false
  });
  console.log('Saved docs/screenshots/work_mobile_2inrow.png');

  await browser.close();
})();
