const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // 1. OPEN MENU OVERLAY
    console.log('Navigating to http://localhost:3000/ and opening menu...');
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1200));

    const menuToggle = await page.$('[data-underlay-nav-toggle]');
    if (menuToggle) {
      await menuToggle.click();
      await new Promise((r) => setTimeout(r, 800));

      await page.screenshot({
        path: 'docs/screenshots/bloombiz_menu_open.png',
        clip: { x: 0, y: 0, width: 1440, height: 750 }
      });
      console.log('Saved docs/screenshots/bloombiz_menu_open.png');

      // Also capture the navbar in the open menu
      await page.screenshot({
        path: 'docs/screenshots/bloombiz_navbar_menu_open.png',
        clip: { x: 0, y: 0, width: 1440, height: 100 }
      });
      console.log('Saved docs/screenshots/bloombiz_navbar_menu_open.png');

      // Close menu
      await menuToggle.click();
      await new Promise((r) => setTimeout(r, 600));
    }

    // 2. CASE STUDY - DARK NAVBAR
    console.log('Navigating to http://localhost:3000/work/tsg-ferreteria/ ...');
    await page.goto('http://localhost:3000/work/tsg-ferreteria/', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1500));

    await page.screenshot({
      path: 'docs/screenshots/bloombiz_navbar_dark_casestudy.png',
      clip: { x: 0, y: 0, width: 1440, height: 120 }
    });
    console.log('Saved docs/screenshots/bloombiz_navbar_dark_casestudy.png');

    // 3. FOOTER VERIFICATION
    console.log('Navigating to Home and scrolling to footer...');
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1000));
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise((r) => setTimeout(r, 1500));

    const footerElem = await page.$('.footer-base');
    if (footerElem) {
      await footerElem.screenshot({ path: 'docs/screenshots/bloombiz_footer_base.png' });
      console.log('Saved docs/screenshots/bloombiz_footer_base.png');
    }

    // 4. MOBILE VIEWPORT (390px)
    console.log('Testing mobile viewport (390x844)...');
    await page.setViewport({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1000));

    await page.screenshot({
      path: 'docs/screenshots/bloombiz_navbar_mobile.png',
      clip: { x: 0, y: 0, width: 390, height: 100 }
    });
    console.log('Saved docs/screenshots/bloombiz_navbar_mobile.png');

    console.log('All verification captures completed!');
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }
})();
