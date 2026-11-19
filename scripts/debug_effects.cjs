const puppeteer = require("puppeteer-core");

async function debugEffects() {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--window-size=1440,900"],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle2" });

  const result = await page.evaluate(() => {
    const blur = document.querySelector("[data-bottom-blur]");
    const vh = window.innerHeight;
    const docH = document.documentElement.scrollHeight;
    
    // Simulate scroll calculation directly
    window.scrollTo(0, 500);
    const scrollY = window.scrollY;
    
    // Trigger scroll event manually
    window.dispatchEvent(new Event("scroll"));

    return {
      vh,
      docH,
      scrollY,
      blurStyle: blur ? blur.getAttribute("style") : null,
      blurK: blur ? blur.style.getPropertyValue("--blur-k") : null,
      blurVis: blur ? window.getComputedStyle(blur).visibility : null
    };
  });

  console.log("Debug result:", result);
  await browser.close();
}

debugEffects().catch(console.error);
