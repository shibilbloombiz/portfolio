const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 2200));

  await page.screenshot({
    path: 'docs/screenshots/hero_curtain_mobile.png',
    clip: { x: 0, y: 0, width: 390, height: 600 }
  });
  console.log('Saved docs/screenshots/hero_curtain_mobile.png');

  await browser.close();
})();
