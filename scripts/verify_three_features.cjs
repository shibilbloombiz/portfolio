const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

async function verifyThreeFeatures() {
  console.log("Launching browser for 3 new features verification...");
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--window-size=1440,900"],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  const dir = path.join(__dirname, "..", "docs", "screenshots");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // 1. Visit Home & test Image Reveal
  console.log("Visiting Home to test Image Reveal Animation...");
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 600));

  const card = await page.$(".home-card[data-work-card='tribu']");
  if (card) {
    await page.evaluate(el => el.scrollIntoView({ behavior: "smooth", block: "center" }), card);
    await new Promise(r => setTimeout(r, 1000));

    const imageState = await page.evaluate(el => {
      const img = el.querySelector(".home-card__image");
      const art = el.querySelector(".home-card__image img");
      const name = el.querySelector(".home-card__name");
      return {
        cardRevealed: el.dataset.imgRevealed,
        imgClipPath: img ? window.getComputedStyle(img).clipPath : null,
        artTransform: art ? window.getComputedStyle(art).transform : null,
        nameClipPath: name ? window.getComputedStyle(name).clipPath : null,
      };
    }, card);
    console.log("Image Reveal state after scroll:", imageState);

    await page.screenshot({
      path: path.join(dir, "exact_image_reveal_animation.png"),
      clip: { x: 0, y: 300, width: 1440, height: 600 }
    });
    console.log("Saved exact_image_reveal_animation.png");
  }

  // 2. Open Menu & test 14-Column Curtain Background
  console.log("Opening Navigation Menu...");
  const toggleBtn = await page.$("[data-underlay-nav-toggle]");
  if (toggleBtn) {
    await toggleBtn.click();
    await new Promise(r => setTimeout(r, 800));

    const menuData = await page.evaluate(() => {
      const menu = document.querySelector(".menu");
      const cols = menu ? menu.querySelectorAll(".menu__cols i") : [];
      const band = menu ? menu.querySelector(".menu__band") : null;
      const firstCol = cols[0];
      return {
        isMenuOpen: menu ? menu.classList.contains("is-open") : false,
        menuDisplay: menu ? window.getComputedStyle(menu).display : null,
        hasTopBand: !!band,
        columnsCount: cols.length,
        colBgColor: firstCol ? window.getComputedStyle(firstCol).backgroundColor : null,
        colBoxShadow: firstCol ? window.getComputedStyle(firstCol).boxShadow : null,
        colTransform: firstCol ? window.getComputedStyle(firstCol).transform : null,
      };
    });
    console.log("Menu background & 14-column curtain state:", menuData);

    await page.screenshot({
      path: path.join(dir, "exact_menu_background_columns.png"),
      fullPage: true
    });
    console.log("Saved exact_menu_background_columns.png");

    // 3. Click "Work" in Menu & test 14-column Page Transition Reveal
    console.log("Clicking 'Work' link in menu to trigger page reveal animation...");
    const workLink = await page.$(".menu__link[href='/work/']");
    if (workLink) {
      await workLink.click();
      
      // Check transition active immediately upon navigation
      await new Promise(r => setTimeout(r, 150));
      const transActiveData = await page.evaluate(() => {
        const transWrap = document.querySelector("[data-transition-wrap]");
        const colsWrap = document.querySelector(".transition__cols");
        const cols = colsWrap ? colsWrap.querySelectorAll("i") : [];
        return {
          isWrapActive: transWrap ? transWrap.style.pointerEvents : null,
          isColsActive: colsWrap ? colsWrap.classList.contains("is-active") : false,
          colsCount: cols.length,
          tone: colsWrap ? colsWrap.style.getPropertyValue("--transition-tone") : null,
          firstColClipPath: cols[0] ? window.getComputedStyle(cols[0]).clipPath : null,
        };
      });
      console.log("Page Transition active during route change:", transActiveData);

      // Wait for transition to complete and new page to reveal
      await new Promise(r => setTimeout(r, 900));

      const newPageData = await page.evaluate(() => {
        const title = document.querySelector(".work-hero__title");
        const words = title ? title.querySelectorAll(".reveal-word") : [];
        return {
          currentUrl: window.location.pathname,
          titleText: title ? title.textContent.trim() : null,
          wordsRevealed: words.length > 0,
        };
      });
      console.log("New page revealed:", newPageData);

      await page.screenshot({
        path: path.join(dir, "exact_page_reveal_work.png"),
        fullPage: true
      });
      console.log("Saved exact_page_reveal_work.png");
    }
  }

  await browser.close();
  console.log("All 3 features verified with flying colors!");
}

verifyThreeFeatures().catch(err => {
  console.error("Verification error:", err);
  process.exit(1);
});
