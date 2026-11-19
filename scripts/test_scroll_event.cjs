const puppeteer = require("puppeteer-core");

async function testScroll() {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });

  const page = await browser.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle2" });

  const testResults = await page.evaluate(() => {
    let scrollFired = 0;
    window.addEventListener("scroll", () => scrollFired++);

    const beforeScrollY = window.scrollY;
    window.scrollTo(0, 600);
    const afterScrollY = window.scrollY;

    const blur = document.querySelector("[data-bottom-blur]");
    return {
      beforeScrollY,
      afterScrollY,
      scrollFired,
      blurStyle: blur ? blur.getAttribute("style") : null,
      blurK: blur ? blur.style.getPropertyValue("--blur-k") : null,
    };
  });

  console.log("Scroll test results:", testResults);

  // Now trigger scroll with puppeteer mouse wheel or dispatchEvent
  const dispatchResult = await page.evaluate(() => {
    window.dispatchEvent(new Event("scroll"));
    const blur = document.querySelector("[data-bottom-blur]");
    return {
      blurStyle: blur ? blur.getAttribute("style") : null,
      blurK: blur ? blur.style.getPropertyValue("--blur-k") : null,
      blurVis: blur ? window.getComputedStyle(blur).visibility : null,
    };
  });
  console.log("After dispatchEvent('scroll'):", dispatchResult);

  await browser.close();
}

testScroll().catch(console.error);
