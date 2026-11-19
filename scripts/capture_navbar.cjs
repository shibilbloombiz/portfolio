const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1200));

  await page.screenshot({
    path: 'docs/screenshots/navbar_cleaned.png',
    clip: { x: 0, y: 0, width: 1440, height: 120 }
  });

  console.log('Saved docs/screenshots/navbar_cleaned.png');
  await browser.close();
})();
