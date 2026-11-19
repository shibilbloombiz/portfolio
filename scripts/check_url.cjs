const puppeteer = require("puppeteer-core");

async function checkUrl() {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });
  const page = await browser.newPage();
  const resp = await page.goto("https://moisez.com/", { waitUntil: "domcontentloaded" });
  console.log("Status:", resp.status());
  console.log("Current URL:", page.url());
  const title = await page.title();
  console.log("Title:", title);
  const snippet = (await page.content()).substring(0, 500);
  console.log("Snippet:", snippet);
  await browser.close();
}

checkUrl().catch(console.error);
