import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const routes = [
  { name: 'home', path: '/' },
  { name: 'work', path: '/work/' },
  { name: 'about', path: '/about/' },
  { name: 'contact', path: '/contact/' },
  { name: 'case_tribu', path: '/work/tribu/' },
  { name: 'case_tsg', path: '/work/tsg-ferreteria/' },
  { name: 'case_21movement', path: '/work/21-movement-reset/' },
  { name: 'case_inzone', path: '/work/inzone/' },
  { name: 'case_footy', path: '/work/footy/' }
];

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'mobile', width: 390, height: 844 }
];

const screenshotDir = path.resolve('docs/screenshots');
fs.mkdirSync(screenshotDir, { recursive: true });

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const baseUrl = 'http://localhost:3000';

  const results = [];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height });
    console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})`);

    for (const r of routes) {
      const url = `${baseUrl}${r.path}`;
      console.log(`  Visiting ${url}...`);

      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.goto(url, { waitUntil: 'networkidle2' });
      await new Promise(res => setTimeout(res, 800));

      const screenshotFile = path.join(screenshotDir, `${r.name}_${vp.name}.png`);
      await page.screenshot({ path: screenshotFile, fullPage: true });

      results.push({
        route: r.path,
        viewport: vp.name,
        errors: errors.length,
        screenshot: screenshotFile
      });
    }
  }

  // Test Kerning interaction on desktop
  console.log('\nTesting Kerning interaction...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle2' });

  const messBtn = await page.$('[data-kern-mess]');
  if (messBtn) {
    await messBtn.click();
    await new Promise(res => setTimeout(res, 600));
    console.log('  Clicked Mess it up');
  }

  const backBtn = await page.$('[data-kern-back]');
  if (backBtn) {
    await backBtn.click();
    await new Promise(res => setTimeout(res, 700));
    console.log('  Clicked Put it back');
  }

  // Test GAS button tooltip on About
  console.log('\nTesting GAS button tooltip...');
  await page.goto(`${baseUrl}/about/`, { waitUntil: 'networkidle2' });
  const gasBtn = await page.$('.about-term');
  if (gasBtn) {
    await gasBtn.click();
    await new Promise(res => setTimeout(res, 400));
    const tip = await page.$('.term-tip');
    console.log('  GAS button clicked, tooltip visible:', !!tip);
  }

  // Test Contact form interaction
  console.log('\nTesting Contact Form...');
  await page.goto(`${baseUrl}/contact/`, { waitUntil: 'networkidle2' });
  await page.type('input[name="name"]', 'Sarah Connor');
  await page.type('input[name="company"]', 'Cyberdyne');
  await page.type('input[name="email"]', 'sarah@resistance.org');
  await page.type('textarea[name="message"]', 'Looking for an iconic brand identity.');
  console.log('  Form fields populated.');

  const sendBtn = await page.$('[data-contact-send]');
  if (sendBtn) {
    await sendBtn.click();
    await new Promise(res => setTimeout(res, 1200));
    const doneScreen = await page.$('.contact__done');
    console.log('  Form submitted, success state visible:', !!doneScreen);
  }

  await browser.close();
  console.log('\nAll tests and screenshots completed!');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
