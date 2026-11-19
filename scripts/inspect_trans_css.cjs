const fs = require("fs");
const css = fs.readFileSync("reference_dump/css/site.css", "utf8");

const transRules = [...css.matchAll(/([^{}]*(?:transition-cols|data-transition)[^{}]*\{[^}]+\})/gi)];
console.log("=== CSS FOR TRANSITION COLS ===");
transRules.forEach(m => console.log(m[1].trim()));
