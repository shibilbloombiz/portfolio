const fs = require("fs");
const html = fs.readFileSync("reference_dump/html/home.html", "utf8");

const heroIdx = html.indexOf("home-hero");
if (heroIdx !== -1) {
  console.log(html.substring(heroIdx - 50, heroIdx + 1200));
}
