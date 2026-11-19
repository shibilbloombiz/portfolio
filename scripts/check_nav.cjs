const fs = require("fs");
const nav = fs.readFileSync("src/components/Navigation/Navigation.tsx", "utf8");
console.log("Navigation has progressive-blur:", nav.includes("progressive-blur"));
const idx = nav.indexOf("progressive-blur");
if (idx !== -1) {
  console.log(nav.substring(idx - 100, idx + 300));
}
