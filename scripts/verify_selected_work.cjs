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

  // Scroll down to #work section
  await page.evaluate(() => {
    const el = document.getElementById('work');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });

  await new Promise((r) => setTimeout(r, 1500));

  // Screenshot 1: Selected Work section header and first card
  await page.screenshot({
    path: 'C:/Users/user/.gemini/antigravity/brain/639ed076-d171-407f-a875-248cdbadb908/verify-work-card-1.png',
  });
  console.log('Saved verify-work-card-1.png');

  // Hover over the first card
  const card = await page.$('.home-card');
  if (card) {
    const box = await card.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await new Promise((r) => setTimeout(r, 800));
    }
  }

  // Screenshot 2: Hover state with center Live View button and cursor
  await page.screenshot({
    path: 'C:/Users/user/.gemini/antigravity/brain/639ed076-d171-407f-a875-248cdbadb908/verify-work-card-hover.png',
  });
  console.log('Saved verify-work-card-hover.png');

  // Scroll down by 700px to see stacking
  await page.evaluate(() => {
    window.scrollBy({ top: 700, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 1200));

  await page.screenshot({
    path: 'C:/Users/user/.gemini/antigravity/brain/639ed076-d171-407f-a875-248cdbadb908/verify-work-card-stacking.png',
  });
  console.log('Saved verify-work-card-stacking.png');

  await browser.close();
})();
