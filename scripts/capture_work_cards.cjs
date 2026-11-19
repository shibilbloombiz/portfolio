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
    await new Promise((r) => setTimeout(r, 1500));

    // Scroll to the work section
    await page.evaluate(() => {
      const el = document.getElementById('work');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise((r) => setTimeout(r, 1500));

    await page.screenshot({
      path: 'docs/screenshots/verify_home_work_cards.png',
      clip: { x: 0, y: 0, width: 1440, height: 900 }
    });
    console.log('Saved docs/screenshots/verify_home_work_cards.png');
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
