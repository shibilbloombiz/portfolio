const fs = require("fs");
const js = fs.readFileSync("reference_dump/js/site.js", "utf8");

const heroMatch = js.indexOf('"hero"');
const hero2 = js.indexOf('home-hero');
console.log("home-hero at:", hero2);
if (hero2 !== -1) {
  console.log(js.substring(hero2 - 200, hero2 + 1000));
}
