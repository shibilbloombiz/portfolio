const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1200));

    await page.screenshot({
      path: 'docs/screenshots/bloombiz_home_hero_full.png',
      clip: { x: 0, y: 0, width: 1440, height: 700 }
    });
    console.log('Saved docs/screenshots/bloombiz_home_hero_full.png');
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
