const fs = require("fs");
const css = fs.readFileSync("reference_dump/css/site.css", "utf8");

const transRules = [...css.matchAll(/([^{}]*(?:\.transition\b|\.transition__)[^{}]*\{[^}]+\})/gi)];
transRules.forEach(m => console.log(m[1].trim()));
