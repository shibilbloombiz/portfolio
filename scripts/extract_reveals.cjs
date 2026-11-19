const fs = require("fs");
const js = fs.readFileSync("reference_dump/js/site.js", "utf8");

// Let's find MZ.motion and MZ.feature("reveals"
const featureReveals = js.indexOf('MZ.feature("reveals"');
console.log("=== MZ.feature('reveals') ===");
console.log(js.substring(featureReveals, featureReveals + 2000));

// Let's find MZ.motion definition
const motionDef = js.indexOf('MZ.motion');
console.log("\n=== MZ.motion definition ===");
console.log(js.substring(motionDef - 100, motionDef + 1200));

// Let's search for all data-reveal in home.html, work.html, about.html, contact.html
["home.html", "work.html", "about.html", "contact.html"].forEach(file => {
  const html = fs.readFileSync(`reference_dump/html/${file}`, "utf8");
  const matches = [...html.matchAll(/(data-reveal[a-z0-9_-]*(?:="[^"]*")?)/gi)].map(m => m[1]);
  console.log(`\n=== Data-reveals in ${file} (${matches.length}) ===`);
  console.log([...new Set(matches)]);
});
