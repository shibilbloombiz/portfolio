const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage();

  // Test 1: Desktop Contact Page (1440x900)
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/contact/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/639ed076-d171-407f-a875-248cdbadb908/verify-contact-desktop-perfect.png' });
  console.log('Saved verify-contact-desktop-perfect.png');

  // Test 2: Tablet Contact Page (768x1024)
  await page.setViewport({ width: 768, height: 1024 });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/639ed076-d171-407f-a875-248cdbadb908/verify-contact-tablet-perfect.png' });
  console.log('Saved verify-contact-tablet-perfect.png');

  // Test 3: Mobile Contact Page (390x844)
  await page.setViewport({ width: 390, height: 844 });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/639ed076-d171-407f-a875-248cdbadb908/verify-contact-mobile-perfect.png' });
  console.log('Saved verify-contact-mobile-perfect.png');

  // Test 4: Verify cursor text on Home project card (desktop)
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1800));

  // Scroll to #work section
  await page.evaluate(() => {
    const el = document.getElementById('work');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1000));

  // Hover over the first card
  const card = await page.$('.home-card');
  if (card) {
    const box = await card.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2);
      await new Promise(r => setTimeout(r, 800));
    }
  }

  // Get tag text
  const tagText = await page.evaluate(() => {
    const tag = document.querySelector('.hover-tag');
    return tag ? tag.textContent : null;
  });
  console.log('Hover tag text:', tagText);

  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/639ed076-d171-407f-a875-248cdbadb908/verify-cursor-old-model.png' });
  console.log('Saved verify-cursor-old-model.png');

  await browser.close();
})();
