const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 640, height: 350 });

  const darkLogoBase64 = 'data:image/png;base64,' + fs.readFileSync('public/images/logos/bloombiz-logo-dark.png').toString('base64');
  const whiteLogoBase64 = 'data:image/png;base64,' + fs.readFileSync('public/images/logos/bloombiz-logo-white.png').toString('base64');
  const iconBase64 = 'data:image/png;base64,' + fs.readFileSync('public/images/logos/bloombiz-icon.png').toString('base64');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #c5bfb4; }
        .card { padding: 24px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .light { background: #ede8db; color: #160d08; }
        .dark { background: #160d08; color: #ede8db; }
        .title { margin: 0 0 14px 0; font-size: 13px; font-weight: 600; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.05em; }
        .row { display: flex; align-items: center; gap: 32px; }
        img { display: block; object-fit: contain; }
      </style>
    </head>
    <body>
      <div class="card light">
        <p class="title">Light Background (--sand: #ede8db):</p>
        <div class="row">
          <img src="${darkLogoBase64}" height="32" alt="Dark Logo" />
          <img src="${iconBase64}" height="30" alt="Icon" />
        </div>
      </div>
      <div class="card dark">
        <p class="title">Dark Background (--case-tone: #160d08):</p>
        <div class="row">
          <img src="${whiteLogoBase64}" height="32" alt="White Logo" />
          <img src="${iconBase64}" height="30" alt="Icon" />
        </div>
      </div>
    </body>
    </html>
  `;

  await page.setContent(html);
  await page.screenshot({ path: 'docs/screenshots/logo_comparison_preview.png' });
  await browser.close();
  console.log('Saved docs/screenshots/logo_comparison_preview.png');
})();
