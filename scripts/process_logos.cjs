const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const srcLogo = "C:/Users/user/.gemini/antigravity/brain/639ed076-d171-407f-a875-248cdbadb908/.user_uploaded/media_1795074026100_ae0c86f7.png";
const srcIcon = "C:/Users/user/.gemini/antigravity/brain/639ed076-d171-407f-a875-248cdbadb908/.user_uploaded/media_1795074026100_8dc257ab.png";

const destDir = path.join("public", "images", "logos");
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

// Copy original logo and icon
fs.copyFileSync(srcLogo, path.join(destDir, "bloombiz-logo-white.png"));
fs.copyFileSync(srcLogo, path.join(destDir, "bloombiz-logo.png"));
fs.copyFileSync(srcIcon, path.join(destDir, "bloombiz-icon.png"));

console.log("Copied bloombiz-logo.png, bloombiz-logo-white.png, bloombiz-icon.png to public/images/logos/");

// Generate bloombiz-logo-dark.png where the white text is converted to #160d08 (dark brown)
// while preserving the cyan/blue gradient infinity loop!
async function generateDarkLogo() {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });
  const page = await browser.newPage();
  const fileUrl = "file:///" + srcLogo.replace(/\\/g, "/");
  await page.goto(fileUrl);

  const base64Dark = await page.evaluate(() => {
    const img = document.querySelector("img");
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;

    // Dark brown color: #160d08 -> (22, 13, 8)
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i+1], b = d[i+2], a = d[i+3];
      if (a > 20) {
        // If it's near-white or grayscale text (letters of bloombiz and TECHNO HUB)
        const isGrayscale = Math.abs(r - g) < 25 && Math.abs(g - b) < 25 && Math.abs(r - b) < 25;
        if (isGrayscale && r > 160) {
          // Replace with dark brown (#160d08), preserving alpha anti-aliasing
          d[i] = 22;     // R
          d[i+1] = 13;   // G
          d[i+2] = 8;    // B
          // Alpha remains d[i+3]
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL("image/png");
  });

  const base64Data = base64Dark.replace(/^data:image\/png;base64,/, "");
  fs.writeFileSync(path.join(destDir, "bloombiz-logo-dark.png"), Buffer.from(base64Data, "base64"));
  console.log("Successfully created bloombiz-logo-dark.png");

  await browser.close();
}

generateDarkLogo().catch(console.error);
