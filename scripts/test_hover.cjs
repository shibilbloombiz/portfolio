const puppeteer = require("puppeteer-core");

async function checkHover() {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--window-size=1440,900"],
    defaultViewport: { width: 1440, height: 900 }
  });
  const page = await browser.newPage();
  await page.goto("https://moisez.com/", { waitUntil: "networkidle2" });

  const html = await page.content();
  console.log("Has data-hover-tag:", html.includes("data-hover-tag"));
  console.log("Has data-bottom-blur:", html.includes("data-bottom-blur"));
  console.log("Has data-reveal-lines:", html.includes("data-reveal-lines"));
  console.log("Has data-reveal:", html.includes("data-reveal"));

  // Check hover over a project card
  const projectCard = await page.$("[data-hover-case]");
  if (projectCard) {
    const box = await projectCard.boundingBox();
    console.log("Project card box:", box);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await new Promise(r => setTimeout(r, 500));
    
    const hoverTagState = await page.evaluate(() => {
      const tag = document.querySelector("[data-hover-tag]");
      if (!tag) return "No tag element";
      return {
        style: tag.getAttribute("style"),
        opacity: window.getComputedStyle(tag).opacity,
        display: window.getComputedStyle(tag).display,
        transform: window.getComputedStyle(tag).transform,
        innerHTML: tag.innerHTML
      };
    });
    console.log("Hover tag state after mouse move:", hoverTagState);
  }

  await browser.close();
}

checkHover().catch(console.error);
