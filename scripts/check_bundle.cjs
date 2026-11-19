const fs = require("fs");
const path = require("path");

const distJs = fs.readdirSync("dist/assets").find(f => f.endsWith(".js"));
console.log("Dist JS file:", distJs);

const code = fs.readFileSync(path.join("dist/assets", distJs), "utf8");

console.log("Includes progressive-blur:", code.includes("progressive-blur"));
console.log("Includes data-bottom-blur:", code.includes("data-bottom-blur"));
console.log("Includes --blur-k:", code.includes("--blur-k"));
console.log("Includes scroll-meter:", code.includes("scroll-meter"));

const idx = code.indexOf("data-bottom-blur");
if (idx !== -1) {
  console.log("Snippet around data-bottom-blur:\n", code.substring(idx - 200, idx + 400));
}
