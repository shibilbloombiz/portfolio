const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. HOME
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'docs/screenshots/company_home.png', fullPage: false });

  // Scroll to hello and take screenshot
  await page.evaluate(() => {
    const el = document.getElementById('hello');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'docs/screenshots/company_home_hello.png', fullPage: false });

  // Scroll to kerning section
  await page.evaluate(() => {
    const el = document.getElementById('details');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'docs/screenshots/company_home_kerning.png', fullPage: false });

  const homeText = await page.evaluate(() => document.body.innerText);

  // 2. ABOUT
  await page.goto('http://localhost:3000/about/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'docs/screenshots/company_about.png', fullPage: false });

  const aboutText = await page.evaluate(() => document.body.innerText);

  // 3. CONTACT
  await page.goto('http://localhost:3000/contact/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'docs/screenshots/company_contact.png', fullPage: false });

  const contactText = await page.evaluate(() => document.body.innerText);

  await browser.close();

  console.log('--- AUDIT REPORT ---');
  const checkText = (name, text) => {
    const regex = /\b(I|I'm|I'll|my|myself)\b/gi;
    const matches = text.match(regex) || [];
    console.log(`Page: ${name}`);
    console.log(`Matches for first-person singular: ${matches.length} [${matches.join(', ')}]`);
  };

  checkText('Home', homeText);
  checkText('About', aboutText);
  checkText('Contact', contactText);

  console.log('Screenshots saved to docs/screenshots/');
})();
