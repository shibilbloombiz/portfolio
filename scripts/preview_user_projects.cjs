const fs = require('fs');
const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1600 });

  const files = fs.readdirSync('public/images/work/projects');
  const cardsHtml = files.map(f => {
    return `
      <div style="background:#1c1917; border-radius:12px; overflow:hidden; color:#fff; font-family:sans-serif; border: 1px solid #333;">
        <img src="http://localhost:3000/images/work/projects/${f}" style="width:100%; height:auto; display:block;" />
        <div style="padding:14px 18px; font-weight:600; font-size:16px;">${f}</div>
      </div>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; padding: 32px; background: #0c0a09; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
      </style>
    </head>
    <body>
      <h1 style="color:#ede8db; font-family:sans-serif; margin-bottom:24px;">Uploaded Project Images (${files.length})</h1>
      <div class="grid">${cardsHtml}</div>
    </body>
    </html>
  `;

  await page.setContent(html);
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: 'docs/screenshots/user_projects_overview.png', fullPage: true });
  await browser.close();
  console.log('Saved docs/screenshots/user_projects_overview.png');
})();
