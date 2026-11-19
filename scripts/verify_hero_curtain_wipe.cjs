const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));

  console.log('1. Page loaded. Checking hero slots and curtain strips...');
  const curtainInfo = await page.evaluate(() => {
    const cards = document.querySelectorAll('.hero-curtain-card');
    const strips = document.querySelectorAll('.curtain-wipe-strip');
    return {
      cardCount: cards.length,
      stripCount: strips.length,
      firstCardSlot: cards[0]?.getAttribute('data-slot'),
      firstCardImage: cards[0]?.querySelector('img')?.src
    };
  });
  console.log('Curtain Info:', curtainInfo);

  // Take screenshot of initial hero
  await page.screenshot({
    path: 'docs/screenshots/hero_curtain_initial.png',
    clip: { x: 0, y: 0, width: 1440, height: 600 }
  });
  console.log('Saved docs/screenshots/hero_curtain_initial.png');

  // 2. Hover over the first hero slot to reveal controls
  console.log('2. Hovering over first hero slot...');
  await page.hover('.home-hero__line:nth-child(1) .hero-curtain-card');
  await new Promise((r) => setTimeout(r, 400));

  await page.screenshot({
    path: 'docs/screenshots/hero_curtain_hover.png',
    clip: { x: 0, y: 0, width: 1440, height: 600 }
  });
  console.log('Saved docs/screenshots/hero_curtain_hover.png (with controls visible)');

  // 3. Click the Next button on the first card
  console.log('3. Clicking Next button to trigger white curtain wipe...');
  const nextBtn = await page.$('.home-hero__line:nth-child(1) .hero-curtain-card .curtain-ctrl--next');
  if (nextBtn) {
    await nextBtn.click();
    // Capture mid-transition (around 300ms)
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({
      path: 'docs/screenshots/hero_curtain_mid_transition.png',
      clip: { x: 0, y: 0, width: 1440, height: 600 }
    });
    console.log('Saved docs/screenshots/hero_curtain_mid_transition.png');

    // Wait for transition to complete (~1.2s total)
    await new Promise((r) => setTimeout(r, 1100));
    await page.screenshot({
      path: 'docs/screenshots/hero_curtain_after_transition.png',
      clip: { x: 0, y: 0, width: 1440, height: 600 }
    });
    console.log('Saved docs/screenshots/hero_curtain_after_transition.png');
  } else {
    console.warn('Next button not found');
  }

  // 4. Test clicking a pagination dot
  console.log('4. Clicking pagination dot...');
  const dots = await page.$$('.home-hero__line:nth-child(1) .hero-curtain-card .curtain-dot');
  if (dots.length > 2) {
    await dots[2].click();
    await new Promise((r) => setTimeout(r, 350));
    await page.screenshot({
      path: 'docs/screenshots/hero_curtain_dot_click_mid.png',
      clip: { x: 0, y: 0, width: 1440, height: 600 }
    });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: 'docs/screenshots/hero_curtain_dot_click_complete.png',
      clip: { x: 0, y: 0, width: 1440, height: 600 }
    });
    console.log('Saved pagination dot transition screenshots');
  }

  // 5. Check image changed
  const finalImage = await page.evaluate(() => {
    return document.querySelector('.home-hero__line:nth-child(1) .hero-curtain-card img')?.src;
  });
  console.log('Initial image:', curtainInfo.firstCardImage);
  console.log('Final image:', finalImage);
  console.log('Image successfully changed:', curtainInfo.firstCardImage !== finalImage);

  await browser.close();
  console.log('Verification complete!');
})();
