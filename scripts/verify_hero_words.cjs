const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

async function verifyHeroWords() {
  console.log("Verifying updated Hero words...");
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--window-size=1440,900"],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 1200));

  const heroData = await page.evaluate(() => {
    const title = document.querySelector(".home-hero__title");
    const words = title ? Array.from(title.querySelectorAll(".home-word span")).map(s => s.textContent.trim()).filter(Boolean) : [];
    return {
      ariaLabel: title ? title.getAttribute("aria-label") : null,
      words: words,
      hasUnderline: !!title.querySelector(".mz-underline")
    };
  });

  console.log("Hero words check:", heroData);

  const dir = path.join(__dirname, "..", "docs", "screenshots");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  await page.screenshot({
    path: path.join(dir, "hero_design_engineer_evolve.png"),
    clip: { x: 0, y: 0, width: 1440, height: 700 }
  });
  console.log("Saved hero_design_engineer_evolve.png");

  await browser.close();
}

verifyHeroWords().catch(console.error);
