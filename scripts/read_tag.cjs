const fs = require("fs");
const js = fs.readFileSync("reference_dump/js/site.js", "utf8");
console.log(js.substring(66600, 68000));
