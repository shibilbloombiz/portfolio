const fs = require("fs");
const js = fs.readFileSync("reference_dump/js/site.js", "utf8");

const motionIdx = js.indexOf('MZ.motion=');
console.log(js.substring(motionIdx - 2000, motionIdx - 800));
