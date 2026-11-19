const fs = require("fs");

// Read PNG and examine palette or RGBA
const f1 = "C:/Users/user/.gemini/antigravity/brain/639ed076-d171-407f-a875-248cdbadb908/.user_uploaded/media_1795074026100_ae0c86f7.png";
const buf = fs.readFileSync(f1);

// Let's use puppeteer or canvas to inspect the image pixels
const puppeteer = require("puppeteer-core");

async function inspectPixels() {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });
  const page = await browser.newPage();
  const fileUrl = "file:///" + f1.replace(/\\/g, "/");
  await page.goto(fileUrl);
  
  const analysis = await page.evaluate(() => {
    const img = document.querySelector("img");
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    let opaquePixels = 0;
    let whitePixels = 0;
    let darkPixels = 0;
    let coloredPixels = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
      if (a > 30) {
        opaquePixels++;
        if (r > 230 && g > 230 && b > 230) whitePixels++;
        else if (r < 50 && g < 50 && b < 50) darkPixels++;
        else coloredPixels++;
      }
    }
    return {
      total: canvas.width * canvas.height,
      opaquePixels,
      whitePixels,
      darkPixels,
      coloredPixels
    };
  });
  
  console.log("Image pixel analysis:", analysis);
  await browser.close();
}

inspectPixels().catch(console.error);
