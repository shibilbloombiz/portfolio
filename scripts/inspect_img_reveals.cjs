const fs = require("fs");
const js = fs.readFileSync("reference_dump/js/site.js", "utf8");

// Print case-figs feature
const caseFigsIdx = js.indexOf('MZ.feature("case-figs"');
if (caseFigsIdx !== -1) {
  console.log("=== CASE-FIGS IN SITE.JS ===");
  console.log(js.substring(caseFigsIdx, caseFigsIdx + 1200));
}

// Print home-card reveal in site.js
const homeCardIdx = js.indexOf('home-card__image');
if (homeCardIdx !== -1) {
  console.log("\n=== HOME-CARD IN SITE.JS ===");
  console.log(js.substring(homeCardIdx - 200, homeCardIdx + 800));
}
