const fs = require("fs");
const js = fs.readFileSync("reference_dump/js/site.js", "utf8");

const transIdx = js.indexOf("data-transition-cols");
console.log("=== FULL PAGE TRANSITION IN SITE.JS ===");
console.log(js.substring(transIdx - 200, transIdx + 3000));
