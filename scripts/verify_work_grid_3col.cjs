const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1200 });

    console.log('Navigating to http://localhost:3000/work/ ...');
    await page.goto('http://localhost:3000/work/', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1500));

    // Check grid layout
    const gridInfo = await page.evaluate(() => {
      const grid = document.querySelector('.work-grid');
      const cards = Array.from(document.querySelectorAll('.work-grid-card'));
      if (!grid) return null;
      const comp = window.getComputedStyle(grid);
      const cols = comp.gridTemplateColumns.split(' ').length;
      return {
        columnsCount: cols,
        cardsCount: cards.length,
        cardNames: cards.map(c => c.querySelector('.work-grid-card__title')?.textContent?.trim()),
        gridComputedCols: comp.gridTemplateColumns
      };
    });
    console.log('Grid Info:', JSON.stringify(gridInfo, null, 2));

    // Capture desktop 3-in-a-row grid screenshot
    await page.screenshot({
      path: 'docs/screenshots/work_grid_3_in_a_row_desktop.png',
      fullPage: true
    });
    console.log('Saved docs/screenshots/work_grid_3_in_a_row_desktop.png');

    // Capture viewport with top 3 projects (row 1)
    await page.screenshot({
      path: 'docs/screenshots/work_grid_row1_closeup.png',
      clip: { x: 0, y: 180, width: 1440, height: 750 }
    });
    console.log('Saved docs/screenshots/work_grid_row1_closeup.png');

    // Test List toggle
    console.log('Testing List toggle...');
    const listBtn = await page.$('.work-view-toggle:nth-child(2)');
    if (listBtn) {
      await listBtn.click();
      await new Promise(r => setTimeout(r, 500));
      await page.screenshot({
        path: 'docs/screenshots/work_toggled_list_view.png',
        clip: { x: 0, y: 180, width: 1440, height: 600 }
      });
      console.log('Saved docs/screenshots/work_toggled_list_view.png');

      // Switch back to Grid
      const gridBtn = await page.$('.work-view-toggle:nth-child(1)');
      if (gridBtn) await gridBtn.click();
      await new Promise(r => setTimeout(r, 500));
    }

    // Test Mobile viewport (390px)
    console.log('Testing Mobile viewport (390px)...');
    await page.setViewport({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/work/', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1200));

    await page.screenshot({
      path: 'docs/screenshots/work_grid_mobile.png',
      clip: { x: 0, y: 120, width: 390, height: 720 }
    });
    console.log('Saved docs/screenshots/work_grid_mobile.png');

    console.log('All verification captures completed successfully!');
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }
})();
