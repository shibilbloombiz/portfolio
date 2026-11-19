const puppeteer = require("puppeteer-core");

async function checkLiveCursor() {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto("https://moisez.com/", { waitUntil: "networkidle2" });

  const cursorData = await page.evaluate(() => {
    const allElements = document.querySelectorAll("*");
    const customCursors = [];
    allElements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.cursor && style.cursor !== "auto" && style.cursor !== "default" && style.cursor !== "pointer") {
        customCursors.push({ tag: el.tagName, class: el.className, cursor: style.cursor });
      }
    });
    
    // Check for elements that follow mouse or cursor
    const mouseFollowers = [];
    document.querySelectorAll("[class*='cursor'], [id*='cursor'], [data-hover-tag], .hover-tag, .sys-insp").forEach(el => {
      mouseFollowers.push({ tag: el.tagName, class: el.className, id: el.id, attrs: Array.from(el.attributes).map(a => `${a.name}="${a.value}"`) });
    });

    return { customCursors, mouseFollowers };
  });

  console.log("Live site cursor data:\n", JSON.stringify(cursorData, null, 2));
  await browser.close();
}

checkLiveCursor().catch(console.error);
