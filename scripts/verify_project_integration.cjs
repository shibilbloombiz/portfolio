const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // 1. HOME HERO SECTION SLOTS
    console.log('1. Checking Home Hero section...');
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 2000));

    const heroSlots = await page.evaluate(() => {
      const slots = Array.from(document.querySelectorAll('.home-slot'));
      return slots.map(s => ({
        slot: s.getAttribute('data-slot'),
        to: s.getAttribute('href'),
        tone: s.getAttribute('data-tone'),
        img: s.querySelector('img')?.getAttribute('src')
      }));
    });
    console.log('Hero slots:', JSON.stringify(heroSlots, null, 2));

    await page.screenshot({
      path: 'docs/screenshots/verify_hero_projects.png',
      clip: { x: 0, y: 0, width: 1440, height: 650 }
    });
    console.log('Saved docs/screenshots/verify_hero_projects.png');

    // 2. HOME SECTION 02: A FEW THINGS I'VE MADE
    console.log('2. Scrolling to Home "A few things I\'ve made" section...');
    await page.evaluate(() => {
      const el = document.getElementById('work');
      if (el) el.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 1500));

    const homeCards = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.home-card'));
      return cards.map(c => ({
        to: c.getAttribute('href'),
        name: c.querySelector('.home-card__name')?.textContent?.trim(),
        line: c.querySelector('.home-card__line')?.textContent?.trim(),
        img: c.querySelector('.home-card__image img')?.getAttribute('src')
      }));
    });
    console.log('Home cards:', JSON.stringify(homeCards, null, 2));

    await page.screenshot({
      path: 'docs/screenshots/verify_home_featured_projects.png',
      clip: { x: 0, y: 0, width: 1440, height: 900 }
    });
    console.log('Saved docs/screenshots/verify_home_featured_projects.png');

    // 3. WORK PAGE: ALL 9 PROJECTS
    console.log('3. Navigating to http://localhost:3000/work/ ...');
    await page.goto('http://localhost:3000/work/', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1500));

    const workRows = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.work-row'));
      return rows.map(r => ({
        to: r.getAttribute('href'),
        name: r.querySelector('.work-row__name')?.textContent?.trim(),
        sector: r.querySelector('.work-row__sector')?.textContent?.trim(),
        year: r.querySelector('.work-row__year')?.textContent?.trim(),
        img: r.querySelector('.work-piece')?.getAttribute('src')
      }));
    });
    console.log(`Work page projects count: ${workRows.length}`);
    console.log('Work page rows:', JSON.stringify(workRows, null, 2));

    await page.screenshot({
      path: 'docs/screenshots/verify_work_page.png',
      fullPage: true
    });
    console.log('Saved docs/screenshots/verify_work_page.png');

    // 4. CASE STUDY: /work/educarrt/
    console.log('4. Navigating to Case Study /work/educarrt/ ...');
    await page.goto('http://localhost:3000/work/educarrt/', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1500));

    await page.screenshot({
      path: 'docs/screenshots/verify_casestudy_educarrt.png',
      clip: { x: 0, y: 0, width: 1440, height: 900 }
    });
    console.log('Saved docs/screenshots/verify_casestudy_educarrt.png');

    // 5. CASE STUDY: /work/ftx/
    console.log('5. Navigating to Case Study /work/ftx/ ...');
    await page.goto('http://localhost:3000/work/ftx/', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1500));

    await page.screenshot({
      path: 'docs/screenshots/verify_casestudy_ftx.png',
      clip: { x: 0, y: 0, width: 1440, height: 900 }
    });
    console.log('Saved docs/screenshots/verify_casestudy_ftx.png');

    console.log('All project integration verifications completed successfully!');
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }
})();
