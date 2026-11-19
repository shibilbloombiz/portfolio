const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

async function captureFinalProof() {
  console.log("Capturing final verification screenshots...");
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--window-size=1440,900"],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  const dir = path.join(__dirname, "..", "docs", "screenshots");

  // 1. Home - Glass blur sticky bar at bottom
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle2" });
  await page.evaluate(() => {
    window.scrollTo(0, 1000);
    window.dispatchEvent(new Event("scroll"));
  });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(dir, "exact_bottom_glass_blur.png"),
    clip: { x: 0, y: 650, width: 1440, height: 250 }
  });
  console.log("Saved exact_bottom_glass_blur.png");

  // 2. Home - Project card hover with custom cursor & [ Open the case ] tag
  const card = await page.$(".home-card[data-hover-case]");
  if (card) {
    await page.evaluate(el => el.scrollIntoView({ behavior: "instant", block: "center" }), card);
    await new Promise(r => setTimeout(r, 400));
    const box = await card.boundingBox();

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
    await new Promise(r => setTimeout(r, 600));

    await page.screenshot({
      path: path.join(dir, "exact_custom_cursor_hover_tag.png"),
      clip: { x: box.x, y: Math.max(0, box.y - 20), width: box.width, height: 500 }
    });
    console.log("Saved exact_custom_cursor_hover_tag.png");
  }

  // 3. Work - Reveal animations
  await page.goto("http://localhost:3000/work/", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(dir, "exact_reveals_work.png"),
    clip: { x: 0, y: 0, width: 1440, height: 750 }
  });
  console.log("Saved exact_reveals_work.png");

  // 4. About - Reveal animations (portrait blinds, sun spin, text masking)
  await page.goto("http://localhost:3000/about/", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(dir, "exact_reveals_about.png"),
    clip: { x: 0, y: 0, width: 1440, height: 750 }
  });
  console.log("Saved exact_reveals_about.png");

  await browser.close();
  console.log("All proof screenshots saved successfully!");
}

captureFinalProof().catch(console.error);
