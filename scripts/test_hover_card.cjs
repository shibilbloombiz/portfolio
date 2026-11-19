const puppeteer = require("puppeteer-core");

async function testHoverCard() {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--window-size=1440,900"],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle2" });

  const card = await page.$(".home-card[data-hover-case]");
  if (card) {
    // Scroll element into view
    await page.evaluate(el => el.scrollIntoView({ behavior: "instant", block: "center" }), card);
    await new Promise(r => setTimeout(r, 400));

    const box = await card.boundingBox();
    console.log("Card bounding box after scroll into view:", box);

    // Move mouse over the card within the visible viewport!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 });
    await new Promise(r => setTimeout(r, 500));

    const state = await page.evaluate(() => {
      const dot = document.querySelector(".custom-cursor__dot");
      const ring = document.querySelector(".custom-cursor__ring");
      const tag = document.querySelector(".hover-tag[data-hover-tag]");
      return {
        dotOpacity: dot ? window.getComputedStyle(dot).opacity : null,
        ringOpacity: ring ? window.getComputedStyle(ring).opacity : null,
        tagOpacity: tag ? window.getComputedStyle(tag).opacity : null,
        tagDisplay: tag ? window.getComputedStyle(tag).display : null,
        tagTransform: tag ? tag.style.transform : null,
        tagText: tag ? tag.textContent.trim() : null,
      };
    });
    console.log("State over card:", state);
  }

  await browser.close();
}

testHoverCard().catch(console.error);
