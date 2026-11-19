const fs = require("fs");
const js = fs.readFileSync("reference_dump/js/site.js", "utf8");

const hero2 = js.indexOf('home-hero');
console.log(js.substring(hero2 + 900, hero2 + 2500));
