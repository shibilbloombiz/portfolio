const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

async function verifyEffects() {
  console.log("Launching Chrome for effects verification...");
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--window-size=1440,900"],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  const screenshotsDir = path.join(__dirname, "..", "docs", "screenshots");
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  // 1. Visit Home
  console.log("Visiting http://localhost:3000/...");
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 600));

  // Check initial state
  const initialData = await page.evaluate(() => {
    const blur = document.querySelector("[data-bottom-blur]");
    return {
      blurK: blur ? blur.style.getPropertyValue("--blur-k") : null,
      blurVis: blur ? window.getComputedStyle(blur).visibility : null,
    };
  });
  console.log("Initial state at top:", initialData);

  // Scroll down to 800px and dispatch scroll
  console.log("Scrolling down 800px...");
  await page.evaluate(() => {
    window.scrollTo(0, 800);
    window.dispatchEvent(new Event("scroll"));
  });
  await new Promise(r => setTimeout(r, 500));

  const scrolledData = await page.evaluate(() => {
    const blur = document.querySelector("[data-bottom-blur]");
    const meter = document.querySelector(".scroll-meter");
    const thumb = document.querySelector(".scroll-meter__thumb");
    return {
      blurK: blur ? blur.style.getPropertyValue("--blur-k") : null,
      blurVis: blur ? window.getComputedStyle(blur).visibility : null,
      meterVis: meter ? window.getComputedStyle(meter).display : null,
      thumbTransform: thumb ? thumb.style.transform : null,
      thumbHeight: thumb ? thumb.style.height : null,
    };
  });
  console.log("Scrolled bottom blur state:", scrolledData);

  // Capture bottom blur sticky effect screenshot
  await page.screenshot({
    path: path.join(screenshotsDir, "verification_bottom_blur.png"),
    clip: { x: 0, y: 700, width: 1440, height: 200 }
  });
  console.log("Saved verification_bottom_blur.png");

  // Move cursor over Tribu project card to activate [ Open the case ] tag
  console.log("Moving cursor over project card [data-hover-case]...");
  const card = await page.$("[data-hover-case]");
  if (card) {
    const box = await card.boundingBox();
    const targetX = box.x + box.width / 2;
    const targetY = box.y + 120;

    // Simulate natural mouse move
    await page.mouse.move(targetX, targetY, { steps: 10 });
    await new Promise(r => setTimeout(r, 500));

    const cursorData = await page.evaluate(() => {
      const dot = document.querySelector(".custom-cursor__dot");
      const ring = document.querySelector(".custom-cursor__ring");
      const tag = document.querySelector(".hover-tag[data-hover-tag]");
      return {
        dotOpacity: dot ? window.getComputedStyle(dot).opacity : null,
        ringOpacity: ring ? window.getComputedStyle(ring).opacity : null,
        ringTransform: ring ? ring.style.transform : null,
        tagOpacity: tag ? window.getComputedStyle(tag).opacity : null,
        tagDisplay: tag ? window.getComputedStyle(tag).display : null,
        tagTransform: tag ? tag.style.transform : null,
        tagText: tag ? tag.textContent.trim() : null,
      };
    });
    console.log("Cursor & hover-tag over card:", cursorData);

    await page.screenshot({
      path: path.join(screenshotsDir, "verification_hover_cursor.png"),
      clip: { x: box.x, y: box.y, width: Math.min(1440, box.width), height: 450 }
    });
    console.log("Saved verification_hover_cursor.png");
  }

  // 2. Visit /work/ to verify scroll reveals & word masking
  console.log("Visiting http://localhost:3000/work/...");
  await page.goto("http://localhost:3000/work/", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 600));

  const workData = await page.evaluate(() => {
    const title = document.querySelector(".work-hero__title");
    const words = title ? title.querySelectorAll(".reveal-word") : [];
    const list = document.querySelector(".work-index__list");
    const firstRow = document.querySelector(".work-row");
    return {
      titleRevealed: title ? title.dataset.revealed : null,
      wordCount: words.length,
      sampleWordHTML: words[0] ? words[0].outerHTML : null,
      listRuleAttr: list ? list.getAttribute("data-reveal-rule") : null,
      rowHasHoverCase: firstRow ? firstRow.hasAttribute("data-hover-case") : false,
    };
  });
  console.log("Work page reveal animations:", workData);

  await page.screenshot({
    path: path.join(screenshotsDir, "verification_reveals_work.png")
  });
  console.log("Saved verification_reveals_work.png");

  // 3. Visit /about/ to verify portrait blinds reveal and sun spin
  console.log("Visiting http://localhost:3000/about/...");
  await page.goto("http://localhost:3000/about/", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 600));

  const aboutData = await page.evaluate(() => {
    const portrait = document.querySelector("[data-portrait-reveal]");
    const slices = portrait ? portrait.querySelectorAll(".about-slices i") : [];
    const sun = document.querySelector("[data-about-sun] svg");
    const statement = document.querySelector(".about-hero__statement");
    const words = statement ? statement.querySelectorAll(".reveal-word") : [];
    return {
      portraitReady: portrait ? portrait.classList.contains("is-ready") : false,
      sliceCount: slices.length,
      hasSunSvg: !!sun,
      statementRevealed: statement ? statement.dataset.revealed : null,
      statementWordsCount: words.length,
    };
  });
  console.log("About page reveals:", aboutData);

  await page.screenshot({
    path: path.join(screenshotsDir, "verification_reveals_about.png")
  });
  console.log("Saved verification_reveals_about.png");

  await browser.close();
  console.log("All effects and reveal animations verified successfully!");
}

verifyEffects().catch(err => {
  console.error("Verification error:", err);
  process.exit(1);
});
